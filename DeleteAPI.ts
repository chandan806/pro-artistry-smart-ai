import { supabase } from "./SupabaseUpload";

export async function deleteFile(path: string, bucket = "uploads") {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw error;
  }

  return {
    success: true,
    message: "File deleted successfully",
  };
}
