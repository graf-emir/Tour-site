export const config = {
  api: {
    bodyParser: false, // Отключаем стандартный парсер Vercel, так как идет файл
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не поддерживается' });
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  try {
    // Читаем входящие данные как FormData через Web API (доступно в современном Node.js на Vercel)
    const webReq = new Request(`https://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: req
    });
    
    const formData = await webReq.formData();

    const itemName = formData.get('itemName');
    const userName = formData.get('userName');
    const userEmail = formData.get('userEmail');
    const userPhone = formData.get('userPhone');
    const file = formData.get('receipt'); // Получаем сам файл чека

    // Формируем текст подписи к файлу
    let message = `🔔 <b>Новая оплата с сайта!</b>\n\n`;
    message += `📦 <b>Тур:</b> ${itemName}\n`;
    message += `👤 <b>Клиент:</b> ${userName}\n`;
    message += `📧 <b>Email:</b> ${userEmail}\n`;
    message += `📱 <b>Контакты:</b> ${userPhone}`;

    let tgUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const tgFormData = new FormData();
    tgFormData.append('chat_id', TELEGRAM_CHAT_ID);
    tgFormData.append('parse_mode', 'HTML');

    // Если пользователь прикрепил файл, отправляем его методом sendDocument
    if (file && file.size > 0) {
      tgUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`;
      tgFormData.append('document', file, file.name);
      tgFormData.append('caption', message); // Текст заявки будет подписью к документу
    } else {
      // Если файла нет, шлем обычное текстовое сообщение
      tgFormData.append('text', message);
    }

    // Отправляем всё это в Telegram
    const response = await fetch(tgUrl, {
      method: 'POST',
      body: tgFormData
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Успешно отправлено!' });
    } else {
      const errorData = await response.json();
      console.error('Ошибка Telegram API:', errorData);
      return res.status(500).json({ success: false, message: 'Ошибка Telegram' });
    }

  } catch (error) {
    console.error('Ошибка сервера отправки:', error);
    return res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
}
