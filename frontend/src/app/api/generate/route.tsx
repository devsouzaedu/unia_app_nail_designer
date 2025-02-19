import { NextResponse } from "next/server";
import sharp from "sharp";

async function processImage(image: File, userPrompt: string): Promise<string> {
  console.log("=== Iniciando processImage ===");
  const overallStart = Date.now();

  // Converter o arquivo para Buffer
  const originalBuffer = Buffer.from(await image.arrayBuffer());
  console.log("Conversão para Buffer concluída.");

  // Redimensionar a imagem para que a largura máxima seja 500px (mantendo a proporção)
  const resizedBuffer = await sharp(originalBuffer)
    .resize({ width: 500, fit: "inside" })
    .jpeg({ quality: 70 })
    .toBuffer();
  console.log("Redimensionamento concluído.");

  // --- Chamada ao microserviço Unia3 para gerar a máscara ---
  const segForm = new FormData();
  // Anexa o arquivo no campo "file" como Blob (usando o FormData global)
  segForm.append("file", new Blob([resizedBuffer], { type: "image/jpeg" }), "image.jpg");

  const unia3Url = process.env.UNIA3_URL || "http://localhost:8000/infer";
  console.log(`Enviando imagem para o microserviço: ${unia3Url}`);
  const unia3Response = await fetch(unia3Url, {
    method: "POST",
    body: segForm,
  });
  console.log("Resposta do microserviço recebida.");

  // Obter a máscara retornada pelo microserviço e converter para Buffer
  const maskBlob = await unia3Response.blob();
  const maskBuffer = Buffer.from(await maskBlob.arrayBuffer());
  const maskImageBase64 = `data:image/png;base64,${maskBuffer.toString("base64")}`;
  console.log("Máscara recebida (base64):", maskImageBase64);

  // --- Preparar payload para a Stability API ---
  const finalPrompt = `Using the submitted hand photo and provided mask, modify only the nail polish on the five nails. DO NOT change any part of the hand. Apply the following design exclusively to the nails: ${userPrompt}. The hand must remain exactly as in the original photo.`;
  console.log("Final prompt:", finalPrompt);

  // Criar FormData para enviar à Stability API (usando o FormData global)
  const stabilityForm = new FormData();
  // Campo "image": imagem original redimensionada
  stabilityForm.append("image", new Blob([resizedBuffer], { type: "image/jpeg" }), "image.jpg");
  // Campo "mask": máscara gerada
  stabilityForm.append("mask", new Blob([maskBuffer], { type: "image/png" }), "mask.png");
  // Campo "prompt": prompt do usuário
  stabilityForm.append("prompt", finalPrompt);
  // Parâmetros adicionais (opcional; ajuste conforme necessário)
  stabilityForm.append("output_format", "png");

  console.log("Enviando dados para a Stability API...");
  const stabilityResponse = await fetch(
    "https://api.stability.ai/v2beta/stable-image/edit/inpaint",
    {
      method: "POST",
      headers: {
        // Não defina manualmente o Content-Type; o fetch com FormData nativo cuidará disso.
        "Accept": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
      },
      body: stabilityForm,
    }
  );
  console.log("Resposta da Stability API recebida.");
  const result = await stabilityResponse.json();
  console.log("Resultado completo da Stability API:", result);

  // Verifica se a resposta contém os dados gerados
  if (result.artifacts && result.artifacts.length > 0) {
    const generatedImageBase64 = result.artifacts[0].base64;
    console.log(`processImage finalizado em ${Date.now() - overallStart} ms`);
    return `data:image/png;base64,${generatedImageBase64}`;
  } else if (result.image) {
    // Caso a API retorne em outro formato
    console.log(`processImage finalizado em ${Date.now() - overallStart} ms`);
    return `data:image/png;base64,${result.image}`;
  } else {
    throw new Error("Nenhuma imagem gerada pela Stability API");
  }
}

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const userPrompt = formData.get("prompt")?.toString() || "";
    
    if (!image || !(image instanceof File)) {
      return NextResponse.json({ error: "Imagem inválida" }, { status: 400 });
    }
    
    console.log("Iniciando processamento com Stability API e microserviço de segmentação...");
    const resultUrl = await processImage(image, userPrompt);
    console.log("Processamento concluído, retornando imagem gerada.");
    return NextResponse.json({ result: resultUrl });
  } catch (error) {
    console.error("Erro no endpoint /generate:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
