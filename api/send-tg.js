export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не поддерживается' });
  }

  // Достаем секретные переменные, которые мы настроим в Vercel
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const { itemName, userName, userEmail, userPhone } = req.body;

  // Формируем текст сообщения
  let message = `<b>Новая заявка с сайта!</b>\n\n`;
  message += `<b>Что хочет:</b> ${itemName}\n`;
  message += `<b>Имя:</b> ${userName}\n`;
  message += `<b>Email:</b> ${userEmail}\n`;
  message += `<b>Контакты:</b> ${userPhone}`;

  try {
    // Отправляем запрос в Telegram с сервера
    const response = await fetch(`https://telegram.org{TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        parse_mode: 'HTML',
        text: message
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Успешно отправлено!' });
    } else {
      const errorData = await response.json();
      console.error('Ошибка Telegram API:', errorData);
      return res.status(500).json({ success: false, message: 'Ошибка Telegram' });
    }
  } catch (error) {
    console.error('Ошибка сервера:', error);
    return res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
}
