export interface LegalLink { label: string; href: string }
export interface LegalSection { title: string; paragraphs?: string[]; items?: string[]; links?: LegalLink[] }
export interface LegalDocument { id: string; title: string; summary: string; sections: LegalSection[] }
export interface LegalContent {
  eyebrow: string
  title: string
  subtitle: string
  badge: string
  version: string
  updated: string
  documents: LegalDocument[]
}

const ru: LegalContent = {
  eyebrow: 'Документы',
  title: 'Правовая информация',
  subtitle: 'Условия использования, обработка данных и сторонние сервисы',
  badge: 'Локальное хранение',
  version: 'Версия приложения 1.0.0',
  updated: 'Редакция от 28 октября 2026 г.',
  documents: [
    {
      id: 'terms', title: 'Пользовательское соглашение', summary: 'Правила использования приложения «Капитал»',
      sections: [
        { title: 'Назначение приложения', paragraphs: ['«Капитал» предназначен для личного учёта активов, обязательств и сценарных финансовых расчётов. Приложение не является банком, платёжным сервисом, брокером или средством совершения финансовых операций.', 'Используя приложение, вы принимаете условия настоящего соглашения. Если вы не согласны с ними, прекратите использование приложения.'] },
        { title: 'Использование и данные пользователя', items: ['Используйте приложение законно и самостоятельно проверяйте вводимые сведения.', 'Обеспечьте защиту устройства, экспортированных файлов и резервных копий.', 'Не нарушайте права правообладателя и условия лицензий сторонних компонентов.'] },
        { title: 'Ответственность', paragraphs: ['Расчёты зависят от введённых данных, настроек и доступности внешних источников. Курсы и цены могут быть неактуальными, а внешние сервисы — временно недоступными. Перед финансовыми решениями проверяйте информацию по первоисточникам.', 'Ничто в соглашении не ограничивает права потребителя, которые не могут быть ограничены по законодательству Республики Беларусь.'] },
      ],
    },
    {
      id: 'privacy', title: 'Политика конфиденциальности', summary: 'Какие данные хранятся и когда выполняются сетевые запросы',
      sections: [
        { title: 'Локальные данные', paragraphs: ['Отображаемое имя, сведения об активах, обязательствах, платежах, заметках и настройках хранятся в локальной базе SQLite на вашем устройстве. Разработчик не получает содержимое этой базы.', 'В приложении нет аккаунтов, рекламных идентификаторов, аналитических счётчиков и облачной синхронизации.'] },
        { title: 'Внешние запросы', paragraphs: ['Если внешние запросы включены, при запуске и обновлении курсов приложение обращается к API Национального банка Республики Беларусь и CoinGecko. Их можно отключить в настройках. Передаются только параметры запроса валют или криптовалют, но не названия позиций, суммы, заметки или отображаемое имя.', 'Провайдеры сервисов и сети могут обрабатывать IP-адрес и технические сведения запроса в соответствии со своими правилами. Работа без обновления курсов не требует передачи содержимого портфеля.'], links: [{ label: 'Политика CoinGecko', href: 'https://www.coingecko.com/en/privacy' }] },
        { title: 'Экспорт и резервные копии', paragraphs: ['JSON, CSV и SQLite-копии создаются по вашей команде и сохраняются в выбранном вами месте. Перед импортом также создаётся локальная автоматическая копия. Эти файлы содержат финансовую информацию и не шифруются приложением.', 'Очистка текущих данных в разделе «Данные» не удаляет ранее экспортированные или автоматические копии. Удаляйте их самостоятельно, если они больше не нужны.'] },
        { title: 'Защита и удаление', paragraphs: ['Используйте пароль операционной системы, ограничение доступа к учётной записи и шифрование диска. Текущие данные можно удалить в разделе «Данные», настройки — сбросить в разделе «Настройки». Поскольку разработчик не получает вашу базу, обращение к нему для её удаления не требуется.'] },
      ],
    },
    {
      id: 'finance', title: 'Финансовое предупреждение', summary: 'Ограничения расчётов и прогнозов',
      sections: [
        { title: 'Информационный характер', paragraphs: ['Приложение ведёт учёт и выполняет математические расчёты. Прогнозы, показатели динамики и оценка структуры портфеля носят информационный характер и не являются индивидуальной инвестиционной рекомендацией, банковской, налоговой или юридической консультацией.'] },
        { title: 'Риски и проверка сведений', paragraphs: ['Доходность не гарантируется. Фактическая стоимость активов, процентные расходы и результат инвестиций могут отличаться от расчётных значений. Проверяйте условия договоров, официальные курсы и котировки перед совершением операций.'] },
      ],
    },
    {
      id: 'third-party', title: 'Сторонние сервисы и лицензии', summary: 'Источники данных и программные компоненты',
      sections: [
        { title: 'Источники данных', paragraphs: ['Курсы валют предоставляются Национальным банком Республики Беларусь. Цены криптовалют предоставляются CoinGecko. Указание источников не означает партнёрства или одобрения приложения с их стороны.'], links: [{ label: 'НБРБ', href: 'https://www.nbrb.by/' }, { label: 'CoinGecko', href: 'https://www.coingecko.com/' }] },
        { title: 'Открытое программное обеспечение', paragraphs: ['Приложение использует компоненты с открытым исходным кодом. Сохраняются уведомления об авторских правах и условия соответствующих лицензий.'], items: ['React, Electron, Vite, Motion, Zod, better-sqlite3, Recharts и i18next — MIT.', 'Lucide — ISC.', 'Остальные уведомления и тексты лицензий находятся в составе соответствующих программных пакетов.'] },
      ],
    },
  ],
}

const en: LegalContent = {
  eyebrow: 'Documents',
  title: 'Legal information',
  subtitle: 'Terms of use, data processing and third-party services',
  badge: 'Local storage',
  version: 'Application version 1.0.0',
  updated: 'Last updated October 28, 2026',
  documents: [
    {
      id: 'terms', title: 'Terms of use', summary: 'Rules for using Capital',
      sections: [
        { title: 'Purpose', paragraphs: ['Capital is intended for personal tracking of assets, liabilities and scenario-based financial calculations. It is not a bank, payment service, broker or a means of executing financial transactions.', 'By using the application, you accept these terms. If you do not agree, stop using the application.'] },
        { title: 'Use and user data', items: ['Use the application lawfully and verify the information you enter.', 'Protect your device, exported files and backups.', 'Do not violate the rights of the copyright holder or third-party component licences.'] },
        { title: 'Liability', paragraphs: ['Calculations depend on entered data, settings and the availability of external sources. Rates and prices may be outdated, and external services may be temporarily unavailable. Verify information with primary sources before making financial decisions.', 'Nothing in these terms limits consumer rights that cannot be limited under the laws of the Republic of Belarus.'] },
      ],
    },
    {
      id: 'privacy', title: 'Privacy policy', summary: 'What is stored and when network requests are made',
      sections: [
        { title: 'Local data', paragraphs: ['Your display name, assets, liabilities, payments, notes and settings are stored in a local SQLite database on your device. The developer does not receive the contents of this database.', 'The application has no accounts, advertising identifiers, analytics trackers or cloud synchronisation.'] },
        { title: 'External requests', paragraphs: ['When external requests are enabled, the application contacts the National Bank of the Republic of Belarus and CoinGecko APIs at launch and when rates are refreshed. External requests can be disabled in Settings. Only currency or cryptocurrency query parameters are sent, not position names, amounts, notes or your display name.', 'Service and network providers may process IP addresses and technical request details under their own policies. Using the application without refreshing rates does not require sharing portfolio contents.'], links: [{ label: 'CoinGecko privacy policy', href: 'https://www.coingecko.com/en/privacy' }] },
        { title: 'Exports and backups', paragraphs: ['JSON, CSV and SQLite copies are created at your request and saved where you choose. A local automatic copy is also created before import. These files contain financial information and are not encrypted by the application.', 'Clearing current data in the Data section does not remove previously exported or automatic copies. Delete them yourself when they are no longer needed.'] },
        { title: 'Protection and deletion', paragraphs: ['Use an operating system password, account access restrictions and disk encryption. Current data can be cleared in the Data section, and settings can be reset in Settings. The developer does not receive your database, so no deletion request to the developer is needed.'] },
      ],
    },
    {
      id: 'finance', title: 'Financial disclaimer', summary: 'Limitations of calculations and forecasts',
      sections: [
        { title: 'Information only', paragraphs: ['The application keeps records and performs mathematical calculations. Forecasts, performance indicators and portfolio allocation assessments are for information only and are not personalised investment advice or banking, tax or legal advice.'] },
        { title: 'Risks and verification', paragraphs: ['Returns are not guaranteed. Actual asset values, interest costs and investment results may differ from calculated values. Check contract terms, official rates and quotations before making transactions.'] },
      ],
    },
    {
      id: 'third-party', title: 'Third-party services and licences', summary: 'Data sources and software components',
      sections: [
        { title: 'Data sources', paragraphs: ['Exchange rates are provided by the National Bank of the Republic of Belarus. Cryptocurrency prices are provided by CoinGecko. Naming these sources does not imply partnership with or endorsement of the application.'], links: [{ label: 'NBRB', href: 'https://www.nbrb.by/' }, { label: 'CoinGecko', href: 'https://www.coingecko.com/' }] },
        { title: 'Open-source software', paragraphs: ['The application uses open-source components. Copyright notices and applicable licence terms are retained.'], items: ['React, Electron, Vite, Motion, Zod, better-sqlite3, Recharts and i18next — MIT.', 'Lucide — ISC.', 'Other notices and licence texts are included with their respective software packages.'] },
      ],
    },
  ],
}

const be: LegalContent = {
  eyebrow: 'Дакументы',
  title: 'Прававая інфармацыя',
  subtitle: 'Умовы выкарыстання, апрацоўка даных і староннія сэрвісы',
  badge: 'Лакальнае захоўванне',
  version: 'Версія прыладавання 1.0.0',
  updated: 'Рэдакцыя ад 28 кастрычніка 2026 г.',
  documents: [
    {
      id: 'terms', title: 'Карыстальніцкае пагадненне', summary: 'Правілы выкарыстання прыладавання «Капітал»',
      sections: [
        { title: 'Прызначэнне прыладавання', paragraphs: ['«Капітал» прызначаны для асабістага ўліку актываў, абавязацельстваў і сцэнарных фінансавых разлікаў. Прыладаванне не з\'яўляецца банкам, плацёжным сэрвісам, брокерам або сродкам здзяйснення фінансавых аперацый.', 'Выкарыстоўваючы прыладаванне, вы прымаеце ўмовы гэтага пагаднення. Калі вы не згодны з імі, спыніце выкарыстанне прыладавання.'] },
        { title: 'Выкарыстанне і даныя карыстальніка', items: ['Выкарыстоўвайце прыладаванне законна і самастойна правярайце ўведзеныя звесткі.', 'Забяспечце абарону прылады, экспартаваных файлаў і рэзервовых копій.', 'Не парушайце правы праваўладальніка і ўмовы ліцэнзій старонніх кампанентаў.'] },
        { title: 'Адказнасць', paragraphs: ['Разлікі залежаць ад уведзеных даных, налад і даступнасці вонкавых крыніц. Курсы і цэны могуць быць неактуальнымі, а вонкавыя сэрвісы — часова недаступнымі. Перад фінансавымі рашэннямі правярайце інфармацыю па першакрыніцах.', 'Нішта ў пагадненні не абмяжоўвае правы спажыўца, якія не могуць быць абмежаваны паводле заканадаўства Рэспублікі Беларусь.'] },
      ],
    },
    {
      id: 'privacy', title: 'Палітыка канфідэнцыйнасці', summary: 'Якія даныя захоўваюцца і калі выконваюцца сеткавыя запыты',
      sections: [
        { title: 'Лакальныя даныя', paragraphs: ['Адлюстроўванае імя, звесткі аб актывах, абавязацельствах, плацяжах, нататках і наладах захоўваюцца ў лакальнай базе SQLite на вашай прыладзе. Распрацоўшчык не атрымлівае змесціва гэтай базы.', 'У прыладаванні няма акаўнтаў, рэкламных ідэнтыфікатараў, аналітычных лічыльнікаў і воблачнай сінхранізацыі.'] },
        { title: 'Вонкавыя запыты', paragraphs: ['Калі вонкавыя запыты ўключаны, пры запуску і абнаўленні курсаў прыладаванне звяртаецца да API Нацыянальнага банка Рэспублікі Беларусь і CoinGecko. Іх можна адключыць у наладах. Перадаюцца толькі параметры запыту валют або криптавалют, але не назвы пазіцый, сумы, нататкі або адлюстроўванае імя.', 'Правайдары сэрвісаў і сетак могуць апрацоўваць IP-адрас і тэхнічныя звесткі запыту паводле сваіх правіл. Праца без абнаўлення курсаў не патрабуе перадачы змесціва партфеля.'], links: [{ label: 'Палітыка CoinGecko', href: 'https://www.coingecko.com/en/privacy' }] },
        { title: 'Экспарт і рэзервовыя копіі', paragraphs: ['JSON, CSV і SQLite-копіі ствараюцца па вашай камандзе і захоўваюцца ў абраным вамі месцы. Перад імпартам таксама ствараецца лакальная аўтаматычная копія. Гэтыя файлы змяшчаюць фінансавую інфармацыю і не шыфруюцца прыладаваннем.', 'Ачыстка бягучых даных у раздзеле «Даныя» не выдаляе раней экспартаваныя або аўтаматычныя копіі. Выдаляйце іх самастойна, калі яны больш не патрэбны.'] },
        { title: 'Абарона і выдаленне', paragraphs: ['Выкарыстоўвайце пароль аперацыйнай сістэмы, абмежаванне доступу да ўліковага запісу і шыфраванне дыска. Бягучыя даныя можна выдаліць у раздзеле «Даныя», налады — скінуць у раздзеле «Налады». Паколькі распрацоўшчык не атрымлівае вашу базу, звяртацца да яго для яе выдалення не трэба.'] },
      ],
    },
    {
      id: 'finance', title: 'Фінансавае папярэджанне', summary: 'Абмежаванні разлікаў і прагнозаў',
      sections: [
        { title: 'Інфармацыйны характар', paragraphs: ['Прыладаванне вядзе ўлік і выконвае матэматычныя разлікі. Прагнозы, паказчыкі дынамікі і ацэнка структуры партфеля маюць інфармацыйны характар і не з\'яўляюцца індывідуальнай інвестыцыйнай рэкамендацыяй, банкаўскай, падатковай або юрыдычнай кансультацыяй.'] },
        { title: 'Рызыкі і праверка звестак', paragraphs: ['Даходнасць не гарантуецца. Фактычны кошт актываў, працэнтныя расходы і вынік інвестыцый могуць адрознівацца ад разліковых значэнняў. Правярайце ўмовы дагавораў, афіцыйныя курсы і каціроўкі перад здзяйсненнем аперацый.'] },
      ],
    },
    {
      id: 'third-party', title: 'Староннія сэрвісы і ліцэнзіі', summary: 'Крыніцы даных і праграмныя кампаненты',
      sections: [
        { title: 'Крыніцы даных', paragraphs: ['Курсы валют прадастаўляюцца Нацыянальным банкам Рэспублікі Беларусь. Цэны криптавалют прадастаўляюцца CoinGecko. Указанне крыніц не азначае партнёрства або ўхвалення прыладавання з іх боку.'], links: [{ label: 'НБРБ', href: 'https://www.nbrb.by/' }, { label: 'CoinGecko', href: 'https://www.coingecko.com/' }] },
        { title: 'Адкрытае праграмнае забеспячэнне', paragraphs: ['Прыладаванне выкарыстоўвае кампаненты з адкрытым зыходным кодам. Захоўваюцца апавяшчэнні аб аўтарскіх правах і ўмовы адпаведных ліцэнзій.'], items: ['React, Electron, Vite, Motion, Zod, better-sqlite3, Recharts і i18next — MIT.', 'Lucide — ISC.', 'Іншыя апавяшчэнні і тэксты ліцэнзій знаходзяцца ў складзе адпаведных праграмных пакетаў.'] },
      ],
    },
  ],
}

export function getLegalContent(language: string) {
  if (language === 'en') return en
  if (language === 'be') return be
  return ru
}
