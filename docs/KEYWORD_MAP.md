# 検索意図マップ（キーワードマップ）

2026-10-07 時点。`npm run seo:map -- --write` で作り直せます。

1ページ・1記事につき、担当する検索語は1つ。同じ語を2か所に持たせません。
重なると、`next dev`／`next build` のときに警告が出て、`npm run seo:audit`（= `npm run check`・毎日の自動投稿の前）が止めます。
「あわせて拾う語」は、ほかのページの担当語と重なってかまいません（そのページへリンクで送ります）。

## 固定ページ

「メニュー」が ○ のページだけ、ヘッダーのメニューに出しています。ほかのページは、本文中のリンク・フッター・パンくず・季節の便りからたどります。

| ページ | メニュー | 担当する検索語 | あわせて拾う語 | 検索意図 | ここでは書かないこと |
| --- | --- | --- | --- | --- | --- |
| `/` トップ | — | **すすきの 寿司** | すすきの 鮨、すすきの おまかせ寿司、札幌 寿司 | すすきので寿司店を探している人が、どんな店かを一目でつかみ、目的別のページへ進む | コースの細目（/omakase）、場面ごとの詳しい案内（各ページ）、「高級寿司とは」の説明（/susukino-sushi）は繰り返さない |
| `/concept` コンセプト | ○ | **R-30 hizen** | R-30 hizen コンセプト、30歳未満 入店不可 寿司、すすきの 鮨 夫婦 | 店名を知った人が、どんな考えの店なのか・なぜ年齢のきまりがあるのかを確かめる | 「大人の隠れ家寿司を探す」一般の検索は /adult-sushi。料金は /omakase |
| `/cuisine` 鮨と料理 | ○ | **すすきの 創作和食** | すすきの 寿司 握り、札幌 鮨 職人、すすきの 寿司 旬 | この店の鮨がどんな仕事で作られているか、料理の方向性を知りたい | コースの構成と料金は /omakase。酒との合わせは /drink。「すすきの 寿司／鮨」そのものはトップの担当 |
| `/omakase` おまかせコース | ○ | **すすきの 寿司 コース** | R-30 hizen コース、R-30 hizen 料金、すすきの 寿司 ディナー | いくらで、何品出て、どれくらい時間がかかるのかを具体的に確かめたい | 「おまかせとは何か」「すすきのでおまかせ寿司を探す」は /omakase-sushi |
| `/drink` お酒 | — | **すすきの 寿司 日本酒** | すすきの 寿司 ワイン、寿司 シャンパン すすきの、札幌 鮨 日本酒 | 鮨と一緒に日本酒やワインを楽しめる店かどうか、どんな飲み方ができるかを知りたい | 銘柄の一覧は載せない（時季で替わるため）。料理の説明は /cuisine |
| `/space` 空間 | ○ | **R-30 hizen 店内** | R-30 hizen 雰囲気、R-30 hizen 席、すすきの 寿司 禁煙 | 店内の雰囲気・席の種類・禁煙かどうかなど、行く前に空間の様子を確かめたい | 「カウンター寿司とは」「すすきのでカウンター寿司を探す」は /counter-sushi |
| `/access` アクセス | ○ | **R-30 hizen アクセス** | R-30 hizen 場所、すすきの駅 寿司、資生館小学校前 寿司、R-30 hizen 営業時間 | 店の場所・行き方・営業時間・支払い方法を確かめたい | 予約の手順は /reservation |
| `/reservation` ご予約 | ○（ご予約） | **R-30 hizen 予約** | すすきの 寿司 予約、すすきの 寿司 当日予約、R-30 hizen 電話 | 予約したい。方法・人数の条件・当日でも取れるか・注意事項を確かめたい | コースの中身は /omakase。場所は /access |
| `/journal` 季節の便り | ○ | **すすきの 寿司 コラム** | 寿司 読みもの、鮨 旬 コラム | 鮨や旬について読みたい。記事の一覧から興味のある話題を探す | 個別の話題は各記事の担当 |
| `/susukino-sushi` すすきのの高級寿司 | — | **すすきの 高級寿司** | すすきの 高級鮨、すすきの おまかせ寿司、すすきの カウンター寿司 | すすきので、きちんとした寿司店・高級な鮨店を探している。何が「高級」なのか、いくらで、どんな夜になるのかを知りたい | 店の全体像はトップ。おまかせの仕組みは /omakase-sushi、カウンターの過ごし方は /counter-sushi、場面ごとの案内は各ページ。ランキング・他店の名前・比較は書かない |
| `/anniversary` 記念日 | — | **すすきの 寿司 記念日** | すすきの 記念日 ディナー、札幌 寿司 記念日、すすきの 寿司 誕生日、結婚記念日 寿司 札幌 | 記念日・誕生日のディナーに使える寿司店を探している。コース・滞在時間・予約・二人での過ごし方を知りたい | 付き合う前後のデートの話（距離感・服装・二軒目）は /date。会社の会食は /business-dinner |
| `/date` デート | — | **すすきの 寿司 デート** | すすきの デート ディナー、札幌 寿司 デート、すすきの カウンター デート | デートで使える寿司店を探している。カウンターの距離感・服装・香り・二軒目までの時間配分を知りたい | 記念日のコース選びと予約は /anniversary |
| `/business-dinner` 接待・会食 | — | **すすきの 寿司 接待** | すすきの 会食、札幌 寿司 接待、すすきの 寿司 会食、すすきの 寿司 貸切 | 接待・会食の店を探す幹事が、人数・予約・予算・会計・相手への配慮を確かめたい | プライベートな記念日は /anniversary |
| `/omakase-sushi` おまかせ寿司とは | — | **すすきの おまかせ寿司** | 札幌 おまかせ寿司、すすきの 寿司 おまかせ、おまかせ 寿司 流れ | おまかせの寿司を体験したい。仕組み・コースの違い・出てくる順番・何を伝えればよいのかを知りたい | 料金の一覧は /omakase に置き、ここでは繰り返さない。席での作法は /counter-sushi |
| `/counter-sushi` カウンター寿司 | — | **すすきの カウンター 寿司** | 札幌 カウンター 寿司、カウンター 寿司 作法、すすきの 寿司 カウンターのみ | カウンターで寿司を食べたい。席・職人との距離・握りたてを味わうということを知りたい | 店内の設備の事実は /space。一人での利用は /solo。おまかせの仕組みは /omakase-sushi |
| `/adult-sushi` 大人の隠れ家 | — | **すすきの 大人 寿司** | すすきの 隠れ家 寿司、すすきの 寿司 静か、札幌 大人 鮨、すすきの 寿司 落ち着いた | 騒がしくない、大人向けの落ち着いた寿司店を探している | 店の成り立ちや考え方は /concept |
| `/solo` お一人で | — | **すすきの 寿司 一人** | すすきの 一人 ディナー、札幌 寿司 一人、すすきの 寿司 出張、おひとりさま 寿司 すすきの | 一人で寿司を食べたい。一人で予約できるか・浮かないか・出張の夜でも間に合うかを知りたい | カウンター全般の作法は /counter-sushi |

## 記事（公開済み 10 本）

優先度: A＝この店にしか書けない話／B＝すすきのでの場面／C＝鮨と酒の一般知識

| 記事 | 分類 | 優先度 | 担当する検索語 | 答えている問い | 支える固定ページ | 公開日 |
| --- | --- | --- | --- | --- | --- | --- |
| `/journal/kobujime-toha` 昆布〆とは｜白身の握りを変える、昆布の仕事 | 鮨の知識 | A | **昆布締め 寿司 とは** | 昆布〆とは何か。なぜ白身の握りに使われ、〆る時間で味がどう変わるのか | `/cuisine` | 2026-10-07 |
| `/journal/omakase-nigate-tsutaekata` おまかせ鮨で、苦手なものはいつ・どう伝えるか | おまかせ | B | **おまかせ 寿司 苦手なもの** | おまかせの鮨店で、アレルギーや苦手な食材をいつ・どう伝えればよいか | `/omakase-sushi` | 2026-10-07 |
| `/journal/sushi-date-fukusou-kaori` 鮨デートの服装と香り｜カウンターに座る前に | デート | B | **寿司 デート 服装** | カウンターの鮨店でのデートに、何を着て、香りをどうすればよいか | `/date` | 2026-10-07 |
| `/journal/sushi-champagne-aisho` 寿司にシャンパンは合うのか｜泡と握りの相性 | 日本酒とワイン | C | **寿司 シャンパン 合う** | 寿司にシャンパンは合うのか。合う理由と、合わせやすい握り | `/drink` | 2026-10-07 |
| `/journal/aki-sushi-neta-shun` 秋の寿司ネタ｜十月・十一月に旨くなる北の魚 | 旬の魚 | C | **秋 寿司ネタ 旬** | 秋に旨くなる北の魚は何か。十月・十一月の寿司ネタと合わせる酒 | `/cuisine` | 2026-10-07 |
| `/journal/sapporo-ryoko-omakase-yoyaku` 札幌旅行でおまかせ鮨を予約するときの段取り | すすきの・札幌 | B | **札幌旅行 寿司 予約** | 札幌旅行で、おまかせの鮨店をどう段取りして予約するか | `/access` | 2026-10-07 |
| `/journal/r30-hizen-course-erabikata` R-30 hizenのコース、どれを選ぶか｜三つの過ごし方 | R-30 hizenのこと | A | **R-30 hizen コース 選び方** | R-30 hizenの三つのコースは、どんな夜にどれを選べばよいか | `/omakase` | 2026-10-07 |
| `/journal/fufu-counter-sushi` 夫婦で座るカウンター鮨｜向かい合わない食事のすすめ | 記念日 | B | **夫婦 カウンター 寿司** | 長く連れ添った夫婦の外食に、なぜカウンターの鮨が合うのか | `/anniversary` | 2026-10-07 |
| `/journal/settai-sushi-mise-erabi` 接待で寿司店を選ぶ前に、幹事が確かめること | 接待・会食 | B | **接待 寿司 店選び** | 接待に寿司店を使う前に、幹事は何を確かめておくべきか | `/business-dinner` | 2026-10-07 |
| `/journal/susukino-sushi-ikkenme` すすきので鮨を一軒目にする夜｜十八時からの組み立て方 | すすきのと寿司 | B | **すすきの 寿司 一軒目** | すすきのの夜に、鮨を一軒目に置くとなぜ組み立てやすいのか | `/susukino-sushi` | 2026-10-07 |

## 店からのメモ（0 件）

`data/shop-notes.ts`。店から聞き取った一次情報。まだ記事にしていないメモがあれば、ほかの題材より先に書きます。

いまは空です。

## これから書く題材（残り 112 本：A 19／B 58／C 35）

| 題材 | 分類 | 優先度 | 担当する検索語 | 出す月 |
| --- | --- | --- | --- | --- |
| `susukino-sushi-yosan` | すすきのと寿司 | B | すすきの 寿司 予算 | 通年 |
| `susukino-sushi-jikan` | すすきのと寿司 | B | すすきの 寿司 所要時間 | 通年 |
| `susukino-sushi-manner` | すすきのと寿司 | B | すすきの 寿司 マナー | 通年 |
| `susukino-sushi-kinen` | すすきのと寿司 | B | すすきの 寿司 禁煙 | 通年 |
| `susukino-sushi-fuyu` | すすきのと寿司 | B | すすきの 寿司 冬 | 12・1・2月 |
| `susukino-sushi-natsu` | すすきのと寿司 | B | すすきの 寿司 夏 | 6・7・8月 |
| `susukino-sushi-funiki` | すすきのと寿司 | B | すすきの 寿司 雰囲気 | 通年 |
| `susukino-sushi-otona-josei` | すすきのと寿司 | B | すすきの 寿司 女性 二人 | 通年 |
| `susukino-sushi-yoyaku-nashi` | すすきのと寿司 | B | すすきの 寿司 予約なし | 通年 |
| `susukino-sushi-ekichika` | すすきのと寿司 | B | すすきの 寿司 駅近 | 通年 |
| `tanjobi-sushi-dinner` | 記念日 | B | 誕生日 寿司 ディナー | 通年 |
| `kanreki-iwai-sushi` | 記念日 | B | 還暦祝い 寿司 | 通年 |
| `shoshin-iwai-sushi` | 記念日 | B | 昇進祝い 食事 寿司 | 通年 |
| `taishoku-iwai-sushi` | 記念日 | B | 退職祝い 食事 寿司 | 通年 |
| `kinenbi-yoyaku-itsu` | 記念日 | B | 記念日 ディナー 予約 いつ | 通年 |
| `ryoshin-shokuji-sushi` | 記念日 | B | 両親 食事 寿司 | 通年 |
| `yonjudai-fufu-kinenbi` | 記念日 | B | 40代 夫婦 記念日 過ごし方 | 通年 |
| `christmas-sushi` | 記念日 | B | クリスマス ディナー 寿司 | 11・12月 |
| `valentine-sushi` | 記念日 | B | バレンタイン ディナー 寿司 | 1・2月 |
| `nyuseki-kinen-shokuji` | 記念日 | B | 入籍 記念 食事 | 通年 |
| `sushi-date-kaiwa` | デート | B | 寿司 デート 会話 | 通年 |
| `hatsu-date-counter` | デート | B | 初デート カウンター 寿司 | 通年 |
| `otona-date-yoru` | デート | B | 大人 デート すすきの 夜 | 通年 |
| `sushi-date-shiharai` | デート | B | 寿司 デート 会計 | 通年 |
| `nigiri-tabekata` | デート | B | 握り寿司 食べ方 | 通年 |
| `yonjudai-date-sapporo` | デート | B | 40代 デート 札幌 | 通年 |
| `sushi-date-sasoikata` | デート | B | 寿司 デート 誘い方 | 通年 |
| `counter-date-kincho` | デート | B | カウンター 寿司 緊張 | 通年 |
| `date-aite-nigate` | デート | B | デート 相手 苦手な食べ物 聞き方 | 通年 |
| `susukino-date-fuyu` | デート | B | すすきの デート 冬 | 12・1・2月 |
| `kaishoku-sekijun-counter` | 接待・会食 | B | カウンター 席順 上座 | 通年 |
| `settai-yosan-kimekata` | 接待・会食 | B | 接待 予算 決め方 | 通年 |
| `kaigai-guest-sushi` | 接待・会食 | B | 海外 ゲスト 接待 寿司 | 通年 |
| `shutcho-kaishoku-sapporo` | 接待・会食 | B | 札幌 出張 会食 | 通年 |
| `shoninzu-kaishoku` | 接待・会食 | B | 少人数 会食 すすきの | 通年 |
| `bonenkai-shoninzu-sushi` | 接待・会食 | B | 忘年会 少人数 寿司 | 11・12月 |
| `kansogei-shoninzu-sushi` | 接待・会食 | B | 送別会 少人数 寿司 | 2・3・4月 |
| `kaishoku-allergy-kakunin` | 接待・会食 | B | 会食 アレルギー 確認 | 通年 |
| `settai-osake-erabikata` | 接待・会食 | B | 接待 お酒 選び方 | 通年 |
| `kanji-toujitsu-nagare` | 接待・会食 | B | 会食 幹事 当日 流れ | 通年 |
| `omakase-nankan` | おまかせ | B | おまかせ 寿司 何貫 | 通年 |
| `omakase-okonomi-chigai` | おまかせ | B | おまかせ お好み 違い | 通年 |
| `omakase-tsuika-chumon` | おまかせ | B | おまかせ 寿司 追加 | 通年 |
| `shuko-toha` | おまかせ | A | 酒肴 とは | 通年 |
| `hassun-toha` | おまかせ | A | 八寸 とは | 通年 |
| `omakase-junban-riyu` | おまかせ | B | 寿司 出す順番 理由 | 通年 |
| `sushi-course-shoshoku` | おまかせ | B | 寿司 コース 少食 | 通年 |
| `omakase-pace` | おまかせ | B | おまかせ 寿司 ペース | 通年 |
| `sushi-shashin-manner` | おまかせ | B | 寿司 写真 撮っていい | 通年 |
| `omakase-shime` | おまかせ | A | 寿司 コース 締め | 通年 |
| `nitsume-toha` | 鮨の知識 | A | 煮ツメ 寿司 とは | 通年 |
| `kakushibocho-toha` | 鮨の知識 | A | 隠し包丁 寿司 とは | 通年 |
| `ginshari-toha` | 鮨の知識 | A | 銀シャリ とは | 通年 |
| `nikiri-toha` | 鮨の知識 | C | 煮切り とは | 通年 |
| `sushi-kanji-chigai` | 鮨の知識 | C | 寿司 鮨 鮓 違い | 通年 |
| `gari-yakuwari` | 鮨の知識 | C | ガリ 役割 | 通年 |
| `ikkan-toha` | 鮨の知識 | C | 寿司 一貫 とは | 通年 |
| `zuke-toha` | 鮨の知識 | C | 漬け 寿司 とは | 通年 |
| `sujime-toha` | 鮨の知識 | C | 酢締め とは | 通年 |
| `toro-chigai` | 鮨の知識 | C | 赤身 中トロ 大トロ 違い | 通年 |
| `hikarimono-toha` | 鮨の知識 | C | 光りもの 寿司 とは | 通年 |
| `wasabi-yakuwari` | 鮨の知識 | C | 寿司 わさび 役割 | 通年 |
| `fuyu-sushi-neta-shun` | 旬の魚 | C | 冬 寿司ネタ 旬 | 12・1・2月 |
| `haru-sushi-neta-shun` | 旬の魚 | C | 春 寿司ネタ 旬 | 3・4・5月 |
| `natsu-sushi-neta-shun` | 旬の魚 | C | 夏 寿司ネタ 旬 | 6・7・8月 |
| `uni-shun-hokkaido` | 旬の魚 | A | 雲丹 旬 北海道 | 5・6・7・8月 |
| `ikura-shun` | 旬の魚 | A | いくら 旬 時期 | 9・10・11月 |
| `kegani-shun` | 旬の魚 | A | 毛蟹 旬 北海道 | 通年 |
| `tachi-shirako` | 旬の魚 | C | 白子 旬 たち | 12・1・2月 |
| `nishin-harutsugeuo` | 旬の魚 | C | 鰊 旬 春告魚 | 2・3・4月 |
| `shishamo-sushi` | 旬の魚 | C | ししゃも 寿司 旬 | 10・11月 |
| `botan-ebi` | 旬の魚 | C | ボタンエビ 旬 北海道 | 通年 |
| `sanma-sushi` | 旬の魚 | C | 秋刀魚 寿司 旬 | 8・9・10月 |
| `buri-hokkaido` | 旬の魚 | C | 鰤 旬 北海道 | 10・11・12月 |
| `hokkigai-shun` | 旬の魚 | C | 北寄貝 旬 寿司 | 12・1・2・3・4月 |
| `sakuramasu-shun` | 旬の魚 | C | 桜鱒 旬 寿司 | 3・4・5月 |
| `tokishirazu` | 旬の魚 | C | 時鮭 トキシラズ 旬 | 5・6・7月 |
| `maika-shun` | 旬の魚 | C | 真烏賊 旬 寿司 | 6・7・8・9月 |
| `hakkaku` | 旬の魚 | C | 八角 魚 寿司 | 11・12・1・2月 |
| `hirame-kanbirame` | 旬の魚 | C | 平目 旬 寿司 | 11・12・1・2月 |
| `sushi-nihonshu-erabikata` | 日本酒とワイン | C | 寿司 日本酒 選び方 | 通年 |
| `sushi-shiro-wine` | 日本酒とワイン | C | 寿司 白ワイン 合う | 通年 |
| `sushi-aka-wine` | 日本酒とワイン | C | 寿司 赤ワイン 合う | 通年 |
| `sushi-highball` | 日本酒とワイン | C | 寿司 ハイボール | 通年 |
| `sushi-shochu` | 日本酒とワイン | C | 寿司 焼酎 合う | 通年 |
| `sushi-beer-saisho` | 日本酒とワイン | C | 寿司 ビール 最初の一杯 | 通年 |
| `nihonshu-ondo-sushi` | 日本酒とワイン | C | 日本酒 温度 寿司 | 通年 |
| `junmai-ginjo-chigai` | 日本酒とワイン | C | 純米 吟醸 違い | 通年 |
| `sushi-osake-junban` | 日本酒とワイン | C | 寿司 お酒 順番 | 通年 |
| `osake-yowai-sushi` | 日本酒とワイン | C | お酒 弱い 寿司 | 通年 |
| `nama-genshu-toha` | 日本酒とワイン | C | 生原酒 とは | 通年 |
| `susukinoeki-otona-dinner` | すすきの・札幌 | B | すすきの駅 周辺 ディナー | 通年 |
| `shiseikan-shiden` | すすきの・札幌 | B | 資生館小学校前 市電 | 通年 |
| `odori-susukino-aruku` | すすきの・札幌 | B | 大通 すすきの 徒歩 | 通年 |
| `sapporo-shutcho-saishubi` | すすきの・札幌 | B | 札幌 出張 最終日 夜 | 通年 |
| `yukimatsuri-dinner` | すすきの・札幌 | B | 雪まつり ディナー 予約 | 1・2月 |
| `sapporo-fuyu-yoru` | すすきの・札幌 | B | 札幌 冬 夜 過ごし方 | 12・1・2月 |
| `sapporo-natsu-ryoko-yoru` | すすきの・札幌 | B | 札幌 夏 旅行 夜 | 6・7・8月 |
| `susukino-arukikata` | すすきの・札幌 | B | すすきの 歩き方 初めて | 通年 |
| `shinchitose-susukino` | すすきの・札幌 | B | 新千歳空港 すすきの 行き方 | 通年 |
| `sapporo-nihaku-yoru` | すすきの・札幌 | B | 札幌 二泊三日 夜 食事 | 通年 |
| `shime-parfait-sushi` | すすきの・札幌 | B | 締めパフェ 鮨のあと | 通年 |
| `r30-hizen-nenrei` | R-30 hizenのこと | A | R-30 hizen 年齢制限 | 通年 |
| `r30-hizen-kaori` | R-30 hizenのこと | A | R-30 hizen 香水 | 通年 |
| `r30-hizen-sanshokudon` | R-30 hizenのこと | A | R-30 hizen 三食丼 | 通年 |
| `r30-hizen-toujitsu` | R-30 hizenのこと | A | R-30 hizen 当日 | 通年 |
| `r30-hizen-shiharai` | R-30 hizenのこと | A | R-30 hizen 支払い | 通年 |
| `r30-hizen-kashikiri` | R-30 hizenのこと | A | R-30 hizen 貸切 | 通年 |
| `r30-hizen-iten` | R-30 hizenのこと | A | R-30 hizen 移転 | 通年 |
| `r30-hizen-fufu` | R-30 hizenのこと | A | R-30 hizen 夫婦 | 通年 |
| `r30-hizen-short-course` | R-30 hizenのこと | A | R-30 hizen ショートコース | 通年 |
| `r30-hizen-meisai` | R-30 hizenのこと | A | R-30 hizen 明細 | 通年 |
