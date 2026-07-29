export function isEmail(val) {
	const langEn = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(val);
	const langRu = /^[\wа-яА-ЯёЁ.-]+@[а-яА-ЯёЁ\d.-]+\.[а-яА-ЯёЁ]{2,}$/.test(val);
	return val && val.length > 0 && (langEn || langRu) || "Некорректный email";
}
