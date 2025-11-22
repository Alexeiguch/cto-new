import sharp from "sharp";

export async function resizeImage(
  inputPath: string,
  outputPath: string,
  width: number = 800,
  height: number = 600
): Promise<void> {
  try {
    await sharp(inputPath).resize(width, height, { fit: "cover" }).toFile(outputPath);
  } catch (error) {
    console.error("Error resizing image:", error);
    throw new Error("Failed to resize image");
  }
}

export async function optimizeImage(
  inputPath: string,
  outputPath: string
): Promise<void> {
  try {
    await sharp(inputPath)
      .jpeg({ quality: 80, progressive: true })
      .toFile(outputPath);
  } catch (error) {
    console.error("Error optimizing image:", error);
    throw new Error("Failed to optimize image");
  }
}

export async function getImageMetadata(
  inputPath: string
): Promise<{ width: number; height: number; format: string }> {
  try {
    const metadata = await sharp(inputPath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
    };
  } catch (error) {
    console.error("Error getting image metadata:", error);
    throw new Error("Failed to get image metadata");
  }
}
