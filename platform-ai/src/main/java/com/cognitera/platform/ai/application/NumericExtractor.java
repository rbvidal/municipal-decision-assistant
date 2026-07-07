package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.model.NumericExtraction;
import com.cognitera.platform.ai.model.NumericExtraction.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Extracts structured numeric data (money, percentages, dates, thresholds,
 * salary grades) from document text for deterministic reasoning.
 *
 * <p>The LLM should reason over these structured fields rather than parsing
 * numbers from plain text — this prevents calculation errors.
 */
@Component
public class NumericExtractor {

    private static final Logger log = LoggerFactory.getLogger(NumericExtractor.class);

    // ── Patterns ──

    // Money: "4.117,53 €", "10.000 Euro", "500 euros", "EUR 1000"
    private static final Pattern MONEY_PATTERN = Pattern.compile(
            "(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?)\\s*(€|Euro|EUR|euros?)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CHARACTER_CLASS);

    // Percentages: "5,5 %", "5.5%", "5,5 Prozent"
    private static final Pattern PERCENTAGE_PATTERN = Pattern.compile(
            "(\\d+(?:[.,]\\d+)?)\\s*(%|Prozent|percent)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CHARACTER_CLASS);

    // Salary grades: "EG 9a Stufe 3", "EG9a/3", "Entgeltgruppe 9a Stufe 3"
    private static final Pattern SALARY_GRADE_PATTERN = Pattern.compile(
            "E(?:ntgeltgruppe|G)\\s*(\\d+[a-z]?)\\s*(?:Stufe\\s*(\\d+)|/\\s*(\\d+))?",
            Pattern.CASE_INSENSITIVE);

    // Salary amounts near grades: "4.117,53 €" near "EG 9a"
    private static final Pattern SALARY_AMOUNT_PATTERN = Pattern.compile(
            "(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?)\\s*(€|Euro|EUR)");

    // Procurement thresholds: "bis 10.000 Euro", "up to 100.000 EUR", "Schwellenwert"
    private static final Pattern THRESHOLD_PATTERN = Pattern.compile(
            "(?:bis|up to|unter|below|ab|above|uber|Schwellenwert|Grenze)\\s*(?:zu)?\\s*" +
            "(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{2})?)\\s*(€|Euro|EUR|euros?)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CHARACTER_CLASS);

    // Dates: "01.02.2025", "1. Februar 2025", "2025-02-01"
    private static final Pattern DATE_PATTERN = Pattern.compile(
            "(?:ab|vom|seit|gültig ab|effective|valid from|effective date)\\s*" +
            "((?:\\d{1,2}[.\\s])?(?:Januar|Februar|März|April|Mai|Juni|Juli|" +
            "August|September|Oktober|November|Dezember|January|February|March|" +
            "April|May|June|July|August|September|October|November|December)\\s*\\d{4}" +
            "|\\d{1,2}\\.\\d{1,2}\\.\\d{4}|\\d{4}-\\d{2}-\\d{2})",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CHARACTER_CLASS);

    /**
     * Extracts all numeric data from the given text.
     */
    public NumericExtraction extract(String text) {
        if (text == null || text.isBlank()) return NumericExtraction.empty();
        Builder builder = new Builder();

        extractMoney(text, builder);
        extractPercentages(text, builder);
        extractSalaryGrades(text, builder);
        extractThresholds(text, builder);
        extractDates(text, builder);

        return builder.build();
    }

    /**
     * Extracts numeric data from a list of texts and returns a merged result.
     */
    public NumericExtraction extractAll(List<String> texts) {
        Builder builder = new Builder();
        for (String text : texts) {
            NumericExtraction single = extract(text);
            single.moneyValues().forEach(builder::addMoney);
            single.percentages().forEach(builder::addPercentage);
            single.salaryGrades().forEach(builder::addSalaryGrade);
            single.thresholds().forEach(builder::addThreshold);
            single.dates().forEach(builder::addDate);
        }
        return builder.build();
    }

    // ── Extractors ──

    private void extractMoney(String text, Builder builder) {
        Matcher m = MONEY_PATTERN.matcher(text);
        while (m.find()) {
            String amountStr = m.group(1).replace(".", "").replace(",", ".");
            try {
                double amount = Double.parseDouble(amountStr);
                String context = getContext(text, m.start(), m.end());
                builder.addMoney(new MoneyValue(amount, "EUR",
                        amountStr + " " + (m.group(2) != null ? m.group(2) : "EUR"),
                        context));
            } catch (NumberFormatException ignored) {}
        }
    }

    private void extractPercentages(String text, Builder builder) {
        Matcher m = PERCENTAGE_PATTERN.matcher(text);
        while (m.find()) {
            try {
                double value = Double.parseDouble(m.group(1).replace(",", "."));
                String context = getContext(text, m.start(), m.end());
                builder.addPercentage(new PercentageValue(value,
                        m.group(1) + "%", context));
            } catch (NumberFormatException ignored) {}
        }
    }

    private void extractSalaryGrades(String text, Builder builder) {
        Matcher gradeMatcher = SALARY_GRADE_PATTERN.matcher(text);
        List<String> foundGrades = new ArrayList<>();

        while (gradeMatcher.find()) {
            String grade = gradeMatcher.group(1);
            int step = 0;
            if (gradeMatcher.group(2) != null) step = Integer.parseInt(gradeMatcher.group(2));
            else if (gradeMatcher.group(3) != null) step = Integer.parseInt(gradeMatcher.group(3));

            // Look for the closest salary amount
            Matcher amountMatcher = SALARY_AMOUNT_PATTERN.matcher(text);
            double amount = 0;
            String context = getContext(text, gradeMatcher.start(), gradeMatcher.end());
            while (amountMatcher.find()) {
                String amtStr = amountMatcher.group(1).replace(".", "").replace(",", ".");
                try {
                    amount = Double.parseDouble(amtStr);
                    context = getContext(text,
                            Math.min(gradeMatcher.start(), amountMatcher.start()),
                            Math.max(gradeMatcher.end(), amountMatcher.end()));
                } catch (NumberFormatException ignored) {}
            }
            foundGrades.add("EG " + grade + (step > 0 ? " Stufe " + step : ""));
            builder.addSalaryGrade(new SalaryGrade("EG " + grade, step, amount, "EUR",
                    null, "TV-L", context));
        }
    }

    private void extractThresholds(String text, Builder builder) {
        Matcher m = THRESHOLD_PATTERN.matcher(text);
        while (m.find()) {
            String amountStr = m.group(1).replace(".", "").replace(",", ".");
            try {
                double amount = Double.parseDouble(amountStr);
                String context = getContext(text, m.start(), m.end());
                builder.addThreshold(new ThresholdValue(amount, "EUR",
                        amountStr + " " + (m.group(2) != null ? m.group(2) : "EUR"),
                        null, context));
            } catch (NumberFormatException ignored) {}
        }
    }

    private void extractDates(String text, Builder builder) {
        Matcher m = DATE_PATTERN.matcher(text);
        while (m.find()) {
            String dateStr = m.group(1).trim();
            String context = getContext(text, m.start(), m.end());
            builder.addDate(new DateValue(null, dateStr,
                    "gültig ab", context));
        }
    }

    private String getContext(String text, int start, int end) {
        int ctxStart = Math.max(0, start - 40);
        int ctxEnd = Math.min(text.length(), end + 60);
        String ctx = text.substring(ctxStart, ctxEnd).replace('\n', ' ').trim();
        if (ctx.length() > 200) ctx = ctx.substring(0, 200) + "...";
        return ctx;
    }
}
