// Переключаем функцию в режим Edge, чтобы Vercel не выдавал 404 при чтении файлов
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Метод не поддерживается' }), { status: 405 });
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  try {
    // Читаем FormData (в Edge это работает идеально)
    const formData = await req.formData();

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

    // Если файл прикреплен и весит больше 0 байт
    if (file && file.size > 0) {
      tgUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`;
      tgFormData.append('document', file, file.name);
      tgFormData.append('caption', message);
    } else {
      tgFormData.append('text', message);
    }

    // Отправляем запрос в Telegram
    const response = await fetch(tgUrl, {
      method: 'POST',
      body: tgFormData,
    });

    if (response.ok) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      const errorData = await response.json();
      console.error('Ошибка Telegram API:', errorData);
      return new Response(JSON.stringify({ success: false, message: 'Ошибка Telegram' }), { status: 500 });
    }

  } catch (error) {
    console.error('Ошибка сервера отправки:', error);
    return new Response(JSON.stringify({ success: false, message: 'Ошибка сервера' }), { status: 500 });
  }
}
