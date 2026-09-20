#!/usr/bin/env bash
# Submit every sitemap URL to IndexNow (Bing, DuckDuckGo, Yandex, Naver, Seznam).
# Google does not use IndexNow; it still needs Search Console. Run after a deploy:
#     scripts/indexnow.sh
set -euo pipefail
HOST="www.louismadrigal.com"
KEY="cdf3a35f47b4a65ac105021874466197"
URLS=$(curl -s "https://$HOST/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | python3 -c 'import json,sys; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))')
COUNT=$(echo "$URLS" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')
CODE=$(curl -s -o /tmp/indexnow.out -w "%{http_code}" -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"$HOST\",\"key\":\"$KEY\",\"keyLocation\":\"https://$HOST/$KEY.txt\",\"urlList\":$URLS}")
echo "IndexNow: submitted $COUNT URLs -> HTTP $CODE (200/202 = accepted)"
[ "$CODE" = "200" ] || [ "$CODE" = "202" ] || { cat /tmp/indexnow.out; exit 1; }
