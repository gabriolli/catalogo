import { formatCurrency } from './formatCurrency.js';

const WHATSAPP_NUMBER = '5511999999999'; // Substituir pelo número real (padrão Brasil)

export function generateWhatsAppLink(cartItems, total) {
  const itemsText = cartItems
    .map((item) => {
      // Garantir fallback pra referencia caso falte
      const refPart = item.referencia ? ` (Ref: ${item.referencia})` : '';
      return `${item.quantidade}x ${item.nome}${refPart} - Tam: ${item.tamanho} - ${formatCurrency(item.preco)}`;
    })
    .join('\n');

  const message = `Olá! Gostaria de fazer o seguinte pedido:\n\n${itemsText}\n\nTotal: ${formatCurrency(total)}\n\nAguardo informações sobre pagamento e entrega!`;
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}
