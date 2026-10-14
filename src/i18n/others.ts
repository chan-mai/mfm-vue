import type { MfmMessages } from '../types/index.js';

type Labels = Omit<MfmMessages, 'justNow' | 'ago' | 'timeIn'>;

function labels(
	search: string,
	copy: string,
	failedToPreviewUrl: string,
	code: string,
	clickToShow: string,
	notes: string,
	following: string,
	followers: string,
	noAccountDescription: string,
	invalidTime: string,
): Labels {
	return {
		search,
		copy,
		failedToPreviewUrl,
		code,
		clickToShow,
		notes,
		following,
		followers,
		noAccountDescription,
		invalidTime,
	};
}

// 相対時刻はIntl.RelativeTimeFormat
export const others: Record<string, MfmMessages> = {
	zh: labels('搜索', '复制', '无法预览', '代码', '点击显示', '帖子', '关注', '关注者', '此用户尚未填写个人简介。', '没有'),
	'zh-tw': labels('搜尋', '複製', '無法預覽', '程式碼', '點擊顯示', '貼文', '追隨中', '追隨者', '此使用者尚未填寫自我介紹。', '無'),
	ko: labels('검색', '복사', '미리 볼 수 없습니다', '코드', '클릭하여 표시', '노트', '팔로잉', '팔로워', '자기소개가 없습니다.', '없음'),
	fr: labels('Rechercher', 'Copier', 'Aperçu indisponible', 'Code', 'Cliquer pour afficher', 'Notes', 'Abonnements', 'Abonnés', 'Cet utilisateur n’a pas encore de biographie.', "Il n'y a rien à voir ici"),
	de: labels('Suchen', 'Kopieren', 'Keine Vorschau verfügbar', 'Code', 'Zum Anzeigen klicken', 'Notizen', 'Folgt', 'Follower', 'Dieser Benutzer hat noch keine Beschreibung.', 'Ungültig'),
	es: labels('Buscar', 'Copiar', 'No se puede previsualizar', 'Código', 'Haz clic para mostrar', 'Notas', 'Siguiendo', 'Seguidores', 'Este usuario aún no tiene biografía.', 'No hay nada que ver aqui'),
	it: labels('Cerca', 'Copia', 'Anteprima non disponibile', 'Codice', 'Clicca per mostrare', 'Note', 'Seguiti', 'Follower', 'Questo utente non ha ancora una biografia.', 'Niente da visualizzare'),
	pt: labels('Pesquisar', 'Copiar', 'Não foi possível pré-visualizar', 'Código', 'Clique para mostrar', 'Notas', 'Seguindo', 'Seguidores', 'Este usuário ainda não tem biografia.', 'Não há nada aqui'),
	ru: labels('Поиск', 'Копировать', 'Предпросмотр недоступен', 'Код', 'Нажмите, чтобы показать', 'Заметки', 'Подписки', 'Подписчики', 'Пользователь пока ничего не рассказал о себе.', 'Ничего нет'),
	uk: labels('Пошук', 'Копіювати', 'Попередній перегляд недоступний', 'Код', 'Натисніть, щоб показати', 'Нотатки', 'Підписки', 'Підписники', 'Користувач ще нічого не розповів про себе.', 'Тут нічого немає'),
	pl: labels('Szukaj', 'Kopiuj', 'Podgląd niedostępny', 'Kod', 'Kliknij, aby pokazać', 'Wpisy', 'Obserwowani', 'Obserwujący', 'Ten użytkownik nie ma jeszcze opisu.', 'Nie ma tu niczego'),
	tr: labels('Ara', 'Kopyala', 'Önizleme yapılamadı', 'Kod', 'Göstermek için tıkla', 'Notlar', 'Takip edilen', 'Takipçiler', 'Bu kullanıcı henüz bir açıklama yazmadı.', 'Geçersiz'),
	id: labels('Cari', 'Salin', 'Tidak dapat menampilkan pratinjau', 'Kode', 'Klik untuk menampilkan', 'Catatan', 'Mengikuti', 'Pengikut', 'Pengguna ini belum menulis bio.', 'Tidak ada sama sekali disini'),
	th: labels('ค้นหา', 'คัดลอก', 'ไม่สามารถแสดงตัวอย่างได้', 'โค้ด', 'คลิกเพื่อแสดง', 'โน้ต', 'กำลังติดตาม', 'ผู้ติดตาม', 'ผู้ใช้นี้ยังไม่ได้เขียนแนะนำตัว', 'ไม่พบผลลัพธ์'),
	vi: labels('Tìm kiếm', 'Sao chép', 'Không thể xem trước', 'Mã', 'Nhấn để hiển thị', 'Ghi chú', 'Đang theo dõi', 'Người theo dõi', 'Người dùng này chưa viết tiểu sử.', 'Không có gì ở đây'),
	ar: labels('بحث', 'نسخ', 'تعذّرت المعاينة', 'الشفرة', 'انقر للعرض', 'الملاحظات', 'يتابع', 'المتابِعون', 'لم يكتب هذا المستخدم نبذة بعد.', 'لا يوجد شيء هنا'),
};
