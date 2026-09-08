export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Метод не поддерживается' });
  }

  const AIRTABLE_PAT = process.env.AIRTABLE_PAT; 
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID; 
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Table 1'; 

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
      return res.status(500).json({ success: false, message: 'Ошибка Airtable' });
    }

    const data = await response.json();

    const tours = data.records.map(record => {
      const fields = record.fields;
      
      // 1. Достаем главную превью-картинку
      let imageUrl = 'placeholder.jpg';
      if (fields.Image && Array.isArray(fields.Image) && fields.Image.length > 0) {
        imageUrl = fields.Image[0].url; // Специфика Airtable: берем url первого элемента
      }

      // 2. ИСПРАВЛЕНО: Правильно вытаскиваем ВСЕ урлы из поля Gallery
      let galleryUrls = [];
      if (fields.Gallery && Array.isArray(fields.Gallery) && fields.Gallery.length > 0) {
        galleryUrls = fields.Gallery.map(item => item.url);
      }

      return {
        id: record.id,
        name: fields.Name || 'Без названия',
        image: imageUrl,
        date: fields.Date || 'Дата уточняется',
        description: fields.Description || 'Описание готовится...',
        price: fields.Price || 'Цена по запросу',
        gallery: galleryUrls // Передаем собранный список ссылок во фронтенд
      };
    });

    return res.status(200).json({ success: true, tours: tours });
  } catch (error) {
    console.error('Ошибка сервера каталога:', error);
    return res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
}

