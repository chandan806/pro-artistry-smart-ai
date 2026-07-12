import { supabase } from "./SupabaseUpload";

export async function renameFile(
  oldPath: string,
  newPath: string,
  bucket = "uploads"
) {
  const { error: copyError } = await supabase.storage
    .from(bucket)
    .copy(oldPath, newPath);

  if (copyError) {
    throw copyError;
  }

  const { error: deleteError } = await supabase.storage
    .from(bucket)
    .remove([oldPath]);

  if (deleteError) {
    throw deleteError;
  }

  return {
    success: true,
    oldPath,
    newPath,
    message: "File renamed successfully"
  };
}
