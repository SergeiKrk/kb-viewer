# Log — web3Crypto

Хронология всех операций над базой знаний.

---

## [2026-07-23] update | Масштабное добавление «Как читать»-врезок (18 страниц, 52 врезки)
- Solidity: mapping, modifier, event indexed
- ERC-20: вложенный mapping, approve+transferFrom, decimals, gas-кеширование
- ERC-721: 4 mapping'а, _isApprovedOrOwner, Soulbound _update, ERC-721A lazy
- Блокчейн: sha256(), транзакция (wei, data), EIP-1559 gas
- DeFi: createConfig L2, Flashbots, healthFactor, x×y=k AMM
- Hardhat: getContractFactory, .connect(), task().setAction(), buildModule()
- OpenZeppelin: наследование is ERC20, keccak256-роли, deployProxy/UUPS, SafeERC20
- wagmi/RainbowKit: useReadContract, writeContract→waitForReceipt, getDefaultConfig
- Subgraph: dataSources YAML, @entity/@derivedFrom, Entity.save(), GraphQL-пагинация
- Паттерны транзакций: writeContract, waitForReceipt, baseError.walk, decodeErrorResult
- GitHub Commit Notary: tx { data: hash }, Proof of Skill: Soulbound mint, Escrow: createBounty→resolveBounty
- План трудоустройства: connect→sign→send, pending→receipt, вопросы собеседования: watchEvent, approve+transferFrom, useReadContracts, writeContractAsync

## [2026-07-19] tool — Hardhat-среда-разработки
- Исследована документация hardhat.org (Hardhat v2/v3)
- Создана wiki/Hardhat-среда-разработки.md — 4 уровня объяснения
- Покрыто: установка, инициализация, компиляция, Hardhat Network, деплой в Sepolia, тестирование (Chai + hardhat-chai-matchers), консоль, скрипты, Hardhat Ignition, система тасков, gas-оптимизация
- Полный разбор Counter.sol через Hardhat: от инициализации до тестов и деплоя
- Обновлён index.md — добавлена ссылка в раздел «Инструменты»

## [2026-07-13] concept — Solidity-основы
- Создан raw/Counter.sol — контракт-счётчик (состояние, события, модификатор, view-функции)
- Создана wiki/Страница Solidity-основы: типы данных, видимость, view/pure/payable, storage vs memory, глобальные переменные, модификаторы, события
- Обновлён index.md — добавлена ссылка в раздел «Концепты»
- Начало Этапа 2 по дорожной карте (Смарт-контракты)

## [2026-07-13] projects — три пет-проекта для портфолио
- Добавлены страницы проектов: GitHub Commit Notary, Proof of Skill, Open Source Sponsor Escrow
- Обновлён index.md — секция «Проекты» с перекрёстными ссылками
- Обновлён этап 5 в Главная.md — старые идеи заменены на три новых проекта с рекомендуемым порядком
- Проекты охватывают: криптографию + хеши, DID + NFT + IPFS, смарт-контракты + оракулы + escrow
