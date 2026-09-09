import { generateText } from "ai"
import { formatDateTime, formatINRFull } from "@/lib/utils/format"

// Modular AI layer.
//
// Summaries are generated ONLY from fields we actually hold in the database.
// The model is explicitly instructed never to invent missing information and
// to answer "Not specified in the available tender data." when a field is
// absent. Swapping providers is a one-line change to `MODEL`.

const MODEL = "openai/gpt-4o-mini"

function buildFacts(tender) {
  const lines = [
    `Title: ${tender.title || "Not specified"}`,
    `Organisation: ${tender.organisationName || "Not specified"}`,
    `Department: ${tender.departmentName || "Not specified"}`,
    `Tender ID: ${tender.sourceId || "Not specified"}`,
    `Reference: ${tender.referenceNumber || "Not specified"}`,
    `Work category: ${tender.category || "Not specified"}`,
    `Product category: ${tender.productCategory || "Not specified"}`,
    `Form of contract: ${tender.formOfContract || "Not specified"}`,
    `District: ${tender.districtName || "Not specified"}`,
    `Location: ${tender.location || "Not specified"}`,
    `Estimated value: ${tender.estimatedValue ? formatINRFull(tender.estimatedValue) : "Not specified"}`,
    `EMD: ${tender.emd ? formatINRFull(tender.emd) : "Not specified"}`,
    `Tender fee: ${tender.tenderFee ? formatINRFull(tender.tenderFee) : "Not specified"}`,
    `Published: ${tender.publishedAt ? formatDateTime(tender.publishedAt) : "Not specified"}`,
    `Bid submission end: ${tender.submissionEndAt ? formatDateTime(tender.submissionEndAt) : "Not specified"}`,
    `Bid opening: ${tender.openingAt ? formatDateTime(tender.openingAt) : "Not specified"}`,
    `Description: ${tender.description || "Not specified"}`,
    `Eligibility: ${tender.eligibility || "Not specified"}`,
  ]
  return lines.join("\n")
}

export async function summarizeTender(tender) {
  const facts = buildFacts(tender)

  const { text } = await generateText({
    model: MODEL,
    system:
      "You are a procurement analyst. Summarize government tenders strictly from the FACTS provided. " +
      "Never invent, assume, or estimate any information. If a detail is absent from the FACTS, write exactly " +
      '"Not specified in the available tender data." Keep it concise and use the exact section headings requested.',
    prompt:
      `FACTS:\n${facts}\n\n` +
      "Produce a summary with these markdown sections, each 1-2 sentences:\n" +
      "### What is this tender?\n" +
      "### Estimated value\n" +
      "### Important dates\n" +
      "### Location\n" +
      "### Eligibility\n" +
      "### Key points to check\n",
    temperature: 0.2,
  })

  return text
}
