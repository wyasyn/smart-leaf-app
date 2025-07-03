import { SaveFormat, manipulateAsync } from "expo-image-manipulator";

export const resizeImage = async (
  uri: string,
  maxWidth: number = 800,
  maxHeight: number = 800
) => {
  try {
    const manipulatedImage = await manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: 0.8, // Compress to 80% quality
        format: SaveFormat.JPEG,
      }
    );
    return manipulatedImage.uri;
  } catch (error) {
    console.error("Error resizing image:", error);
    return uri; // Return original URI if resize fails
  }
};
