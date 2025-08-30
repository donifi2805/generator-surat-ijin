// Handler default Vercel untuk serverless function.
export default async function handler(request, response) {
    // 1. Konfigurasi
    // PASTIKAN NAMA PENGGUNA DAN REPO BENAR
    const GITHUB_USERNAME = 'donifi2805';
    // --- INI SUDAH DIPERBAIKI SESUAI NAMA REPO ---
    const GHUB_REPO = 'generator-surat-ijin'; 
    
    // 2. Ambil token dari Vercel Environment Variables
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // 3. Cek metode request & keberadaan token
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Metode tidak diizinkan. Harap gunakan POST.' });
    }

    if (!GITHUB_TOKEN) {
         return response.status(500).json({ message: 'Kesalahan Server: GITHUB_TOKEN belum diatur di Vercel.' });
    }

    // 4. Proses request
    try {
        const { fileName, content } = request.body;
        if (!fileName || !content) {
            return response.status(400).json({ message: 'Input tidak valid. `fileName` dan `content` wajib diisi.' });
        }
        
        // Encode konten ke Base64
        const contentBase64 = Buffer.from(content).toString('base64');
        const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${fileName}`;

        const payload = {
            message: `[Bot] Menambahkan file: ${fileName}`,
            content: contentBase64,
            committer: {
                name: 'Generator Dokumen Bot',
                email: 'bot@example.com',
            },
        };

        const githubResponse = await fetch(GITHUB_API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Vercel-Serverless-Function'
            },
            body: JSON.stringify(payload),
        });

        const result = await githubResponse.json();

        if (!githubResponse.ok) {
            const errorMessage = result.message || 'Terjadi kesalahan saat berkomunikasi dengan GitHub API.';
            console.error('GitHub API Error:', result);
            return response.status(githubResponse.status).json({ message: `GitHub Error: ${errorMessage}` });
        }

        return response.status(200).json({ 
            message: 'File berhasil disimpan ke GitHub!',
            fileUrl: result.content.html_url 
        });

    } catch (error) {
        console.error('Internal Server Error:', error);
        return response.status(500).json({ message: error.message || 'Terjadi kesalahan tak terduga di server.' });
    }
}

