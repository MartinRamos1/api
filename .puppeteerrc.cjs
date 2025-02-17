module.exports = {
    executablePath: process.env.CHROME_EXECUTABLE_PATH || null, // Usar una ruta específica si es necesario
    headless: true, // Asegurarse de que Chromium se ejecute en modo headless
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Opciones recomendadas para entornos serverless
  };
  