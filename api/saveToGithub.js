// Handler default Vercel untuk serverless function.
export default async function handler(request, response) {
    // --- BAGIAN KONFIGURASI PENTING ---
    // Pastikan nama pengguna dan nama repo di bawah ini sudah benar.
    const GITHUB_USERNAME = 'donifi2805';
    const GITHUB_REPO = 'generator-surat-ijin'; // Harus sama persis dengan nama repo di GitHub
    
    // Mengambil token dari Vercel Environment Variables
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // Hanya izinkan metode POST
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Metode tidak diizinkan. Harap gunakan POST.' });
    }

    // Cek apakah token sudah diatur di Vercel
    if (!GITHUB_TOKEN) {
         return response.status(500).json({ message: 'Kesalahan Server: GITHUB_TOKEN belum diatur di Vercel Environment Variables.' });
    }

    try {
        // Ambil nama file dan konten dari body request
        const { fileName, content } = request.body;
        if (!fileName || !content) {
            return response.status(400).json({ message: 'Input tidak valid. `fileName` dan `content` wajib diisi.' });
        }
        
        // Encode konten file ke format Base64 yang dibutuhkan oleh GitHub API
        const contentBase64 = Buffer.from(content).toString('base64');
        
        // URL untuk GitHub API
        const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${fileName}`;

        // Payload yang akan dikirim ke GitHub
        const payload = {
            message: `[Bot] Menambahkan file: ${fileName}`,
            content: contentBase64,
            committer: {
                name: 'Generator Dokumen Bot',
                email: 'bot@example.com',
            },
        };

        // Kirim request ke GitHub API untuk membuat/memperbarui file
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

        // Jika GitHub mengembalikan error, teruskan error tersebut
        if (!githubResponse.ok) {
            const errorMessage = result.message || 'Terjadi kesalahan saat berkomunikasi dengan GitHub API.';
            console.error('GitHub API Error:', result);
            return response.status(githubResponse.status).json({ message: `GitHub Error: ${errorMessage}` });
        }

        // Jika berhasil
        return response.status(200).json({ 
            message: 'File berhasil disimpan ke GitHub!',
            fileUrl: result.content.html_url 
        });

    } catch (error) {
        // Tangani error tak terduga
        console.error('Internal Server Error:', error);
        return response.status(500).json({ message: error.message || 'Terjadi kesalahan tak terduga di server.' });
    }
}

