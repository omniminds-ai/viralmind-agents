export const chatWithAgent = async (message: string, screenshotPath: string | null = null): Promise<void> => {
  if (!screenshotPath) {
    throw new Error("Screenshot is required for GUI automation");
  }

  try {
    const result = await window.electronAPI.runAgent(message, screenshotPath);
    if (!result.success) {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error in GUI agent:', error);
    throw error;
  }
};
