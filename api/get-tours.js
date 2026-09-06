export default async function handler(req, res) {
  // Разрешаем только GET запросы
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не поддерживается' });
  }

  // Достаем секреты Airtable из настроек Vercel
  const AIRTABLE_PAT = process.env.AIRTABLE_PAT; // Ваш Personal Access Token
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID; // ID базы данных
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Table 1'; // Имя таблицы

  // URL для запроса к Airtable API
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка Airtable API:', errorData);
      return res.status(500).json({ success: false, message: 'Ошибка получения данных из Airtable' });
    }

    const data = await response.json();

    // Форматируем данные в простой и понятный для фронтенда вид
    const tours = data.records.map(record => {
      const fields = record.fields;
      
      let imageUrl = 'placeholder.jpg';
      if (fields.Image && Array.isArray(fields.Image) && fields.Image.length > 0) {
        imageUrl = fields.Image[0].url;
      }

      return {
        id: record.id, // ID записи нам критически важен для связи страниц!
        name: fields.Name || 'Без названия',
        image: imageUrl,
        date: fields.Date || 'Дата уточняется',
        // ДОБАВИЛИ ДВА НОВЫХ ПОЛЯ:
        description: fields.Description || 'Описание готовится...',
        price: fields.Price || 'Цена по запросу'
      };
    });


    return res.status(200).json({ success: true, tours: tours });
  } catch (error) {
    console.error('Ошибка сервера каталога:', error);
    return res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
}
