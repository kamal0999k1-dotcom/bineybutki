export async function analyzeQuestion(fileData: string, mimeType: string) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileData, mimeType }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to analyze question");
  }

  const data = await response.json();
  return data.text;
}
