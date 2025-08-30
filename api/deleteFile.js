// File: /api/deleteFile.js

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { fileName, sha } = req.body;

  // Validasi input
  if (!fileName || !sha) {
    return res.status(400).json({ message: 'fileName and sha are required' });
  }

  // Ambil token dan detail repo dari environment variables
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO_OWNER = 'donifi2805'; // Ganti dengan username GitHub Anda
  const GITHUB_REPO_NAME = 'generator-surat-ijin'; // Ganti dengan nama repositori Anda

  const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${fileName}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `feat: delete ${fileName}`,
        sha: sha,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API Error: ${errorData.message}`);
    }

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file from GitHub:', error);
    res.status(500).json({ message: error.message });
  }
}
