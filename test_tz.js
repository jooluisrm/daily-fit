const date = new Date('2024-01-02T02:00:00Z'); // 2AM UTC on Jan 2 is 11PM BRT on Jan 1
const tz = 'America/Sao_Paulo';
const formatted = new Intl.DateTimeFormat('pt-BR', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
console.log(formatted); // Expect 01/01/2024
