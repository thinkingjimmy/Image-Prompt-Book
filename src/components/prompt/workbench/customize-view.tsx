/**
 * [INPUT]: 依赖 ./prompt-state 的 usePromptState，依赖 @/lib/prompt/template 的 parseTemplate/toParagraphs/replacementFor，依赖 @/components/ui/dropdown-menu 与 @/components/ui/menu-radio-item
 * [OUTPUT]: 对外提供 CustomizeView 客户端组件
 * [POS]: components/prompt/workbench 的 Prompt 正文（参考 ImageFX）：以站点语言呈现完整模板，短值为句内下拉 chip，整段参数以 chip 起首、所选段落与正文同色
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useMemo } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MenuRadioItem } from "@/components/ui/menu-radio-item";
import type { Parameter } from "@/lib/content/schema";
import { parseTemplate, replacementFor, toParagraphs } from "@/lib/prompt/template";
import { cn } from "@/lib/utils";
import { usePromptState } from "./prompt-state";

function ParameterSelect({ parameter, variant }: { parameter: Parameter; variant: "inline" | "block" }) {
  const t = useTranslations("detail");
  const { data, selections, setSelection } = usePromptState();
  const locale = data.uiLocale;
  const selected = parameter.options.find((option) => option.id === selections[parameter.id]) ?? parameter.options[0]!;
  const parameterLabel = data.parameterLabels[parameter.id] ?? parameter.id;

  return (
    <DropdownMenu>
      {/* A span (not a button) so long options wrap like the sentence around them instead of forming a centered box. */}
      <DropdownMenuTrigger asChild>
        <span
          // Radix supplies aria-haspopup, aria-expanded and aria-controls on the child.
          role="button"
          tabIndex={0}
          aria-label={t("optionFor", { parameter: parameterLabel, option: selected.labels[locale] })}
          data-parameter={parameter.id}
          className={cn(
            "group/trigger cursor-pointer rounded-md bg-param px-1 py-0.5 font-medium text-param-foreground transition-colors outline-none [box-decoration-break:clone] [-webkit-box-decoration-break:clone] hover:bg-param-border/80 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-param-border/80",
            variant === "block" && "mr-1",
          )}
        >
          {/* Inline chips read as part of the sentence, so they show the actual wording; block chips name the choice. */}
          {(() => {
            const text = variant === "inline" ? replacementFor(parameter, selected.id, locale) : selected.labels[locale];
            const last = Array.from(text).at(-1) ?? "";
            // The arrow is glued to the last character so a wrap never leaves it alone on a line.
            return (
              <>
                {text.slice(0, text.length - last.length)}
                <span className="whitespace-nowrap">
                  {last}
                  <ChevronDown aria-hidden className="ml-0.5 inline size-3.5 -translate-y-px opacity-60 transition-transform group-data-[state=open]/trigger:rotate-180" />
                </span>
              </>
            );
          })()}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" collisionPadding={16} aria-label={parameterLabel} className="max-w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-1.5">
        <DropdownMenuRadioGroup value={selected.id} onValueChange={(value) => setSelection(parameter.id, value)}>
          {parameter.options.map((option) => (
            <MenuRadioItem key={option.id} value={option.id}>
              {option.labels[locale]}
            </MenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** A whole-paragraph option: the chip leads the paragraph; the chosen text reads like the rest of the prompt. */
function BlockParameter({ parameter }: { parameter: Parameter }) {
  const { data, selections } = usePromptState();
  const paragraphs = replacementFor(parameter, selections[parameter.id] ?? parameter.default, data.uiLocale).split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {index === 0 && <ParameterSelect parameter={parameter} variant="block" />}
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function CustomizeView() {
  const { data, variant } = usePromptState();
  const paragraphs = useMemo(() => toParagraphs(parseTemplate(variant.template)), [variant.template]);
  const byId = useMemo(() => new Map(variant.parameters.map((parameter) => [parameter.id, parameter])), [variant.parameters]);

  return (
    <div lang={data.uiLocale} data-testid="prompt-text" className="flex flex-col gap-3.5 text-[15px] leading-[1.9] text-foreground/85">
      {paragraphs.map((paragraph, index) => {
        if (paragraph.kind === "heading") {
          return (
            <h3 key={index} className="mt-3 text-[15px] font-semibold text-foreground first:mt-0">
              {paragraph.text}
            </h3>
          );
        }
        const [only] = paragraph.nodes;
        const soleBlock = paragraph.nodes.length === 1 && only?.type === "token" && byId.get(only.id)?.renderAs === "block";
        if (soleBlock) return <BlockParameter key={index} parameter={byId.get(only.id)!} />;
        return (
          <p key={index} className="whitespace-pre-line">
            {paragraph.nodes.map((node, nodeIndex) => {
              if (node.type === "text") return <Fragment key={nodeIndex}>{node.value}</Fragment>;
              const parameter = byId.get(node.id);
              return parameter ? <ParameterSelect key={nodeIndex} parameter={parameter} variant="inline" /> : null;
            })}
          </p>
        );
      })}
    </div>
  );
}
