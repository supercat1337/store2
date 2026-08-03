import fs from 'fs';
import path from 'path';

const tempDir = './dist/types-temp/src';
const outputFile = './dist/types.d.ts';
const headerFile = './src/types.d.ts';

function fix(content) {
    return (
        content
            // Удаляем стандартные импорты и ре-экспорты
            .replace(/^(import|export).*?from\s+['"].*?['"];?/gm, '')
            // УДАЛЯЕМ ИНЛАЙН-ИМПОРТЫ: заменяем import("../../index.js").TypeName на TypeName
            .replace(/import\(['"].*?['"]\)\./g, '')
            // Удаляем пустые строки
            .trim()
    );
}

function bundleTypes() {
    // 1. Читаем заголовок (ваши интерфейсы и declare global)
    let finalContent = '';

    if (fs.existsSync(headerFile)) {
        finalContent += fs.readFileSync(headerFile, 'utf8') + '\n';
    }

    finalContent = fix(finalContent);

    // Удаляем самоссылающиеся типы (type X = X;)
    finalContent = finalContent.replace(/^type\s+(\w+)\s*=\s*\1\s*;?\s*$/gm, '');

    // 2. Получаем список всех .d.ts файлов в папке, исключая index.d.ts
    // (потому что index.d.ts в temp обычно содержит просто export { ... })
    const files = fs
        .readdirSync(tempDir, { recursive: true })
        // @ts-ignore
        .filter(file => file.endsWith('.d.ts') && file !== 'index.d.ts');

    console.log(`Found ${files.length} type files to bundle...`);

    files.forEach(file => {
        // @ts-ignore
        const filePath = path.join(tempDir, file);
        console.log(filePath);
        let content = fs.readFileSync(filePath, 'utf8');

        // 3. Очистка содержимого
        content = fix(content);

        if (content) {
            finalContent += `\n/* From ${file} */\n` + content + '\n';
        }
    });

    // ----- Удаляем export у внутренних сущностей -----
    const internalNames = [
        'Engine',
        'SubscribeController',
        'BatchSnapshot',
        'UpdateDataRecordManager',
        'ChangedItemsController',
        'Tracker',
        'IdService',
        'ModeControllerService',
        'changedItemsController',
        'dependencyTracker',
        'idService',
        'modeController',
        'EngineMessages',
        'ATOM',
        'COMPUTED',
        'COLLECTION',
        'SHALLOW_REACTIVE',
        // ---- добавленные ----
        'getArrayOfUsedReactiveItems',
        'getSetOfUsedReactiveItems',
    ];

    for (const name of internalNames) {
        const regex = new RegExp(
            `\\bexport\\s+(class|interface|type|function|const|namespace|enum)\\s+${name}\\b`,
            'g'
        );
        finalContent = finalContent.replace(regex, (match, keyword) => `${keyword} ${name}`);
    }
    // -------------------------------------------------

    // 4. Финальная чистка: убираем множественные пустые строки
    finalContent = finalContent.replace(/\n{3,}/g, '\n\n');

    fs.writeFileSync(outputFile, finalContent);
    console.log(`Bundle created: ${outputFile}`);
}

bundleTypes();
