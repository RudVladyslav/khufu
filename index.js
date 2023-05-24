const plaintext = "Hello, World!"; // Текст, который нужно зашифровать
const key = "Secret"; // Ключ шифрования

function khufuRoundFunction(input, roundKey) {
  const expandedInput = expand(input); // Расширение входного блока до 48 бит
  const mixed = mix(expandedInput, roundKey); // Смешивание блока с раундовым ключом
  const substituted = substitute(mixed); // Замена битов блока
  const permuted = permute(substituted); // Перестановка битов блока
  return permuted;
}

// Функция для расширения блока до 48 бит
function expand(block) {
  // Расширение выполняется путем повторения первых 16 бит блока
  return block.substr(0, 16) + block + block.substr(16, 16);
}

// Функция для смешивания блока с раундовым ключом
function mix(block, roundKey) {
  // Смешивание выполняется побитовым XOR'ом блока и раундового ключа
  return xorStrings(block, roundKey);
}

// Функция для замены битов блока
function substitute(block) {
  // Здесь необходимо реализовать замену битов согласно спецификации шифра Khufu
  // Используйте таблицы замен (S-блоки) для замены битов блока
  const substitutionTable = [
    '1100', '0100', '1101', '0001', '0010', '1111', '1011', '1000',
    '1010', '0110', '1101', '1110', '0111', '0000', '0101', '1011'
  ];

  let substitutedBlock = '';

  for (let i = 0; i < 48; i += 4) {
    const nibble = block.substr(i, 4);
    const substitutedNibble = substitutionTable[parseInt(nibble, 2)];
    substitutedBlock += substitutedNibble;
  }

  return substitutedBlock;
}

// Функция для перестановки битов блока
function permute(block) {
  // Здесь необходимо реализовать перестановку битов блока согласно спецификации шифра Khufu
  // Используйте таблицы перестановок (P-блоки) для перестановки битов блока
  const permutationTable = [
    0, 16, 32, 48, 1, 17, 33, 49, 2, 18, 34, 50, 3, 19, 35, 51,
    4, 20, 36, 52, 5, 21, 37, 53, 6, 22, 38, 54, 7, 23, 39, 55,
    8, 24, 40, 56, 9, 25, 41, 57, 10, 26, 42, 58, 11, 27, 43, 59
  ];

  let permutedBlock = '';

  for (let i = 0; i < 48; i++) {
    const index = permutationTable[i];
    permutedBlock += block[index];
  }

  return permutedBlock;
}

function khufuEncrypt(text, key) {
  // Проверяем длину ключа
  if (key.length !== 6) {
    throw new Error("Размер ключа должен быть 48 бит (6 байт)");
  }

  // Преобразуем текст в бинарное представление
  const binaryText = text
  .split('')
  .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
  .join('');

  // Генерируем подключи для каждого раунда
  const roundKeys = generateRoundKeys(key);

  // Разбиваем бинарное представление текста на блоки по 64 бита
  const blocks = [];
  for (let i = 0; i < binaryText.length; i += 64) {
    blocks.push(binaryText.substr(i, 64));
  }

  // Шифруем каждый блок текста
  const encryptedBlocks = blocks.map((block) => encryptBlock(block, roundKeys));

  // Объединяем зашифрованные блоки в одну строку
  // Возвращаем зашифрованный текст
  return encryptedBlocks.join('');
}

// Функция для генерации подключей для каждого раунда
function generateRoundKeys(key) {
  const roundKeys = [];

  // Преобразуем ключ в бинарное представление
  const binaryKey = key
  .split('')
  .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
  .join('');

  // Генерируем 48 подключей для каждого раунда
  for (let i = 0; i < 48; i++) {
    roundKeys.push(binaryKey.substr(i, 48));
  }

  return roundKeys;
}

// Функция для шифрования блока текста
function encryptBlock(block, roundKeys) {
  let left = block.substr(0, 32);
  let right = block.substr(32, 32);

  for (let i = 0; i < 48; i++) {
    const roundKey = roundKeys[i];
    const roundFunction = khufuRoundFunction(left, roundKey);

    const temp = left;
    left = right;
    right = xorStrings(temp, roundFunction);
  }

  return left + right;
}


// Функция для побитового XOR двух строк битов
function xorStrings(a, b) {
  let result = '';

  for (let i = 0; i < a.length; i++) {
    result += a[i] !== b[i] ? '1' : '0';
  }

  return result;
}




try {
  const encryptedText = khufuEncrypt(plaintext, key);
  console.log("Зашифрованный текст:", encryptedText);
} catch (error) {
  console.error("Произошла ошибка при шифровании:", error.message);
}

function mauersUniversalTest() {
  const encryptedText = khufuEncrypt(plaintext, key);

  // Проверяем, что зашифрованный текст не является исходным текстом
  if (encryptedText === plaintext) {
    console.log("Универсальный тест Мауэра не пройден: зашифрованный текст совпадает с исходным текстом.");
    return;
  }

  // Проверяем, что зашифрованный текст имеет ожидаемую длину
  const expectedLength = plaintext.length * 8;
  if (encryptedText.length !== expectedLength) {
    console.log(`Универсальный тест Мауэра не пройден: зашифрованный текст имеет неправильную длину (${encryptedText.length} бит вместо ${expectedLength} бит).`);
    return;
  }

  // Проверяем, что зашифрованный текст является двоичной строкой
  if (!/^[01]+$/.test(encryptedText)) {
    console.log("Универсальный тест Мауэра не пройден: зашифрованный текст содержит недопустимые символы.");
    return;
  }

  console.log("Универсальный тест Мауэра успешно пройден!");
}

function linearComplexityTest() {

  // Генерируем различные размеры входных данных
  const inputSizes = [1000, 2000, 3000, 4000, 5000];

  // Запускаем тест для каждого размера входных данных
  inputSizes.forEach((size) => {
    const startTime = performance.now(); // Засекаем начальное время

    // Запускаем шифрование
    const encryptedText = khufuEncrypt(plaintext, key);

    const endTime = performance.now(); // Засекаем конечное время

    const elapsedTime = endTime - startTime; // Вычисляем время выполнения

    console.log(`Размер входных данных: ${size}, Время выполнения: ${elapsedTime} мс`);
  });
}
function serialTest() {
  const encryptedText = khufuEncrypt(plaintext, key);

  const seriesLength = 5; // Длина серии, которую будем проверять

  let currentSeries = encryptedText.charAt(0);
  let seriesCount = 1;
  let foundSeries = false;

  // Проверяем наличие серий в зашифрованном тексте
  for (let i = 1; i < encryptedText.length; i++) {
    const currentBit = encryptedText.charAt(i);

    if (currentBit === currentSeries) {
      seriesCount++;
      if (seriesCount === seriesLength) {
        foundSeries = true;
        break;
      }
    } else {
      currentSeries = currentBit;
      seriesCount = 1;
    }
  }

  if (foundSeries) {
    console.log(`Найдена серия длины ${seriesLength} с повторяющимися битами: ${currentSeries.repeat(seriesLength)}`);
  } else {
    console.log(`Тест на серии (последовательность битов) пройден для длины серии ${seriesLength}.`);
  }
}

// Запускаем тесты
serialTest();
mauersUniversalTest();
linearComplexityTest();
