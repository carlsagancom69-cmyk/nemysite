// ========== Вспомогательные функции ==========

function showError(message) {
    document.getElementById('results').innerHTML = `<p class="error">Ошибка: ${message}</p>`;
}

// Моногибридное скрещивание (возвращает таблицу HTML)
function monoCross(parent1, parent2, dominant) {
    const recessive = dominant.toLowerCase();
    // проверка генотипов
    const valid = /^[A-Za-z]{2}$/;
    if (!valid.test(parent1) || !valid.test(parent2)) {
        showError("Генотипы должны состоять из двух букв (например, Aa)");
        return null;
    }
    for (let ch of parent1+parent2) {
        if (ch.toUpperCase() !== dominant && ch.toLowerCase() !== recessive) {
            showError(`Генотипы могут содержать только буквы ${dominant} и ${recessive}`);
            return null;
        }
    }
    const gam1 = [parent1[0], parent1[1]];
    const gam2 = [parent2[0], parent2[1]];
    const counts = {};
    for (let g1 of gam1) {
        for (let g2 of gam2) {
            let a1 = g1.toUpperCase() === dominant ? dominant : recessive;
            let a2 = g2.toUpperCase() === dominant ? dominant : recessive;
            let genotype = a1 + a2;
            if (genotype[0] !== dominant && genotype[1] === dominant) genotype = genotype[1] + genotype[0];
            counts[genotype] = (counts[genotype] || 0) + 1;
        }
    }
    const total = 4;
    let html = '<h3>Моногибридное скрещивание</h3><table><tr><th>Генотип</th><th>Вероятность</th><th>Фенотип</th></tr>';
    for (let [gen, cnt] of Object.entries(counts)) {
        let prob = (cnt/total*100).toFixed(2)+'%';
        let phen = gen.includes(dominant) ? 'Доминантный' : 'Рецессивный';
        html += `<tr><td>${gen}</td><td>${prob}</td><td>${phen}</td></tr>`;
    }
    html += '</table>';
    return html;
}

// Дигибридное скрещивание AaBb × AaBb (независимое)
function dihybridCross(dom1, dom2) {
    const rec1 = dom1.toLowerCase();
    const rec2 = dom2.toLowerCase();
    const parentGametes = [
        dom1+dom2, dom1+rec2, rec1+dom2, rec1+rec2
    ];
    const counts = {};
    for (let g1 of parentGametes) {
        for (let g2 of parentGametes) {
            let genotype = '';
            // По первому гену
            let a1 = g1[0], a2 = g2[0];
            let gene1 = (a1 === dom1 || a2 === dom1) ? dom1 : rec1;
            gene1 = (gene1 === dom1) ? dom1 : rec1;
            // Чтобы получить генотип в порядке dom+rec, если гетерозигота
            let genotype1 = '';
            if (a1 === dom1 && a2 === dom1) genotype1 = dom1+dom1;
            else if (a1 === rec1 && a2 === rec1) genotype1 = rec1+rec1;
            else genotype1 = dom1+rec1;
            // второй ген
            let b1 = g1[1], b2 = g2[1];
            let genotype2 = '';
            if (b1 === dom2 && b2 === dom2) genotype2 = dom2+dom2;
            else if (b1 === rec2 && b2 === rec2) genotype2 = rec2+rec2;
            else genotype2 = dom2+rec2;
            genotype = genotype1 + genotype2;
            counts[genotype] = (counts[genotype] || 0) + 1;
        }
    }
    const total = 16;
    let html = '<h3>Дигибридное скрещивание (независимое)</h3><table><thead><tr><th>Генотип</th><th>Вероятность</th><th>Фенотип (по первому гену)</th><th>Фенотип (по второму гену)</th></tr></thead><tbody>';
    for (let [gen, cnt] of Object.entries(counts)) {
        let prob = (cnt/total*100).toFixed(2)+'%';
        let phen1 = gen[0] === dom1 || gen[1] === dom1 ? 'Доминантный' : 'Рецессивный';
        let phen2 = gen[2] === dom2 || gen[3] === dom2 ? 'Доминантный' : 'Рецессивный';
        html += `<tr><td>${gen}</td><td>${prob}</td><td>${phen1}</td><td>${phen2}</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
}

// Кумулятивная полимерия (2 гена, аддитивный эффект)
// Признак определяется количеством доминантных аллелей (от 0 до 4).
// Фенотипы: 0 -> крайний рецессив, 4 -> крайний доминантный, промежуточные.
function polyCross(dominant) {
    const recessive = dominant.toLowerCase();
    // Все возможные генотипы потомства от AaBb × AaBb с частотой из дигибридного скрещивания
    const parentGametes = [dominant+dominant, dominant+recessive, recessive+dominant, recessive+recessive];
    const counts = {}; // ключ = число доминантных аллелей
    for (let g1 of parentGametes) {
        for (let g2 of parentGametes) {
            let alleles = [g1[0], g1[1], g2[0], g2[1]];
            let domCount = alleles.filter(a => a === dominant).length;
            counts[domCount] = (counts[domCount] || 0) + 1;
        }
    }
    const total = 16;
    let html = '<h3>Кумулятивная полимерия (аддитивная)</h3><p>Количество доминантных аллелей определяет выраженность признака.</p><table><thead><tr><th>Число доминантных<br>аллелей</th><th>Доля потомства</th><th>Вероятность</th><th>Фенотип (пример)</th></tr></thead><tbody>';
    // сортировка по количеству
    for (let i=0; i<=4; i++) {
        let cnt = counts[i] || 0;
        let prob = (cnt/total*100).toFixed(2)+'%';
        let phen;
        if (i===0) phen = 'Крайне слабый (рецессивный)';
        else if (i===1) phen = 'Слабый';
        else if (i===2) phen = 'Средний';
        else if (i===3) phen = 'Сильный';
        else phen = 'Крайне сильный (максимум)';
        html += `<tr><td>${i}</td><td>${cnt}/16</td><td>${prob}</td><td>${phen}</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
}

// ========== Основной обработчик ==========
function calculate() {
    const crossType = document.getElementById('crossType').value;
    let resultHtml = '';
    if (crossType === 'mono') {
        const p1 = document.getElementById('parent1_mono').value.trim();
        const p2 = document.getElementById('parent2_mono').value.trim();
        const dom = document.getElementById('dominant_mono').value.trim().toUpperCase();
        resultHtml = monoCross(p1, p2, dom);
        if (!resultHtml) return;
    }
    else if (crossType === 'di') {
        const dom1 = document.getElementById('dom1').value.trim().toUpperCase();
        const dom2 = document.getElementById('dom2').value.trim().toUpperCase();
        if (!dom1 || !dom2 || dom1.length!==1 || dom2.length!==1) {
            showError('Введите доминантные аллели для двух генов (по одной букве)');
            return;
        }
        resultHtml = dihybridCross(dom1, dom2);
    }
    else if (crossType === 'poly') {
        const dom = document.getElementById('dominant_poly').value.trim().toUpperCase();
        if (!dom || dom.length!==1) {
            showError('Введите доминантный аллель (одна буква)');
            return;
        }
        resultHtml = polyCross(dom);
    }
    document.getElementById('results').innerHTML = resultHtml;
}

// Переключение видимых блоков в зависимости от типа скрещивания
function toggleBlocks() {
    const type = document.getElementById('crossType').value;
    document.getElementById('monoBlock').style.display = (type === 'mono') ? 'block' : 'none';
    document.getElementById('diBlock').style.display = (type === 'di') ? 'block' : 'none';
    document.getElementById('polyBlock').style.display = (type === 'poly') ? 'block' : 'none';
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('crossType');
    if (select) select.addEventListener('change', toggleBlocks);
    const btn = document.getElementById('calculateBtn');
    if (btn) btn.addEventListener('click', calculate);
    toggleBlocks(); // установить начальное состояние
});