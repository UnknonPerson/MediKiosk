#!/bin/bash
# E2E verification of remaining flows (document, timeline, summary, authz)
set -o pipefail

ACCESS_TOKEN=$(sed -n '1p' /tmp/e2e_tokens.txt)
BASE="http://localhost:5000/api/v1"
INTAKE_ID="6aa2e16ec56fd2157b89a112"
CONSULTATION_ID="6aa2e13bc56fd2157b89a111"

echo "=== DOCUMENT: Upload valid PDF ==="
DOC_RESP=$(curl -s -X POST "$BASE/documents/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@./test_doc.pdf;type=application/pdf" \
  -F "documentType=LAB_REPORT" \
  -F "consultationId=$CONSULTATION_ID")
echo "$DOC_RESP"
echo ""
echo "$DOC_RESP" | node -e "const d=require('fs').readFileSync(0,'utf8');try{const j=JSON.parse(d); if(j.data?.document?._id) console.log('DOC_ID='+j.data.document._id); else console.log('NO_DOC_ID');}catch(e){console.log('PARSE_ERR')}" > /tmp/doc_result.txt
cat /tmp/doc_result.txt

DOC_ID=$(sed -n 's/^DOC_ID=//p' /tmp/doc_result.txt)
echo ""
echo "=== DOCUMENT: List documents ==="
curl -s -X GET "$BASE/documents/" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
echo ""
echo ""
echo "=== PROCESSING STATUS for doc $DOC_ID ==="
if [ -n "${DOC_ID:-}" ]; then
  curl -s -X GET "$BASE/documents/$DOC_ID/processing-status" \
    -H "Authorization: Bearer $ACCESS_TOKEN"
  echo ""
else
  echo "SKIPPED - no doc id"
fi
echo ""
echo "=== TIMELINE ==="
curl -s -X GET "$BASE/timeline/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | head -c 1500
echo ""
echo ""
echo "=== SUMMARY ==="
curl -s -X GET "$BASE/summary/" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
echo ""
echo ""
echo "=== AUTHZ: unauthenticated timeline ==="
curl -s -X GET "$BASE/timeline/"
echo ""
echo "=== AUTHZ: unauthenticated summary ==="
curl -s -X GET "$BASE/summary/"
echo ""
echo "=== AUTHZ: unauthenticated documents ==="
curl -s -X GET "$BASE/documents/"
echo ""
echo "=== AUTHZ: unauth processing status ==="
curl -s -X GET "$BASE/documents/6aa2e13bc56fd2157b89a111/processing-status"
echo ""