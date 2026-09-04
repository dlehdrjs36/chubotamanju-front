const parseMarkdownBlocks = (markdown) => {
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({
      type: "list",
      items: listItems,
    });
    listItems = [];
  };

  markdown
    .trim()
    .split("\n")
    .forEach((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        flushParagraph();
        flushList();
        return;
      }

      if (trimmedLine === "---") {
        flushParagraph();
        flushList();
        blocks.push({ type: "divider" });
        return;
      }

      const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);

      if (headingMatch) {
        flushParagraph();
        flushList();
        blocks.push({
          type: "heading",
          depth: headingMatch[1].length,
          text: headingMatch[2],
        });
        return;
      }

      const listMatch = trimmedLine.match(/^\*\s+(.+)$/);

      if (listMatch) {
        flushParagraph();
        listItems.push(listMatch[1]);
        return;
      }

      flushList();
      paragraphLines.push(trimmedLine);
    });

  flushParagraph();
  flushList();

  return blocks;
};

const parsePolicyMarkdown = ({ fallbackTitle, markdown }) => {
  const blocks = parseMarkdownBlocks(markdown);
  const titleBlock = blocks.find(
    (block) => block.type === "heading" && block.depth === 1,
  );
  const groups = [];
  let currentGroup = null;

  const pushCurrentGroup = () => {
    if (!currentGroup) {
      return;
    }

    groups.push(currentGroup);
    currentGroup = null;
  };

  blocks
    .filter((block) => block !== titleBlock)
    .forEach((block) => {
      if (block.type === "divider") {
        pushCurrentGroup();
        return;
      }

      if (block.type === "heading" && block.depth === 2) {
        pushCurrentGroup();
        currentGroup = {
          type: "section",
          title: block.text,
          blocks: [],
        };
        return;
      }

      if (!currentGroup) {
        currentGroup = {
          type: "content",
          blocks: [],
        };
      }

      currentGroup.blocks.push(block);
    });

  pushCurrentGroup();

  return {
    title: titleBlock?.text ?? fallbackTitle,
    groups,
  };
};

const renderInlineText = (text) => {
  return text
    .split(/(\*\*.+?\*\*|`.+?`)/g)
    .filter(Boolean)
    .map((token, index) => {
      if (token.startsWith("**") && token.endsWith("**")) {
        return (
          <strong
            className="font-black text-slate-800"
            key={`${token}-${index}`}
          >
            {token.slice(2, -2)}
          </strong>
        );
      }

      if (token.startsWith("`") && token.endsWith("`")) {
        return (
          <code
            className="rounded-lg bg-slate-900 px-2 py-1 text-[13px] font-black text-white"
            key={`${token}-${index}`}
          >
            {token.slice(1, -1)}
          </code>
        );
      }

      return token;
    });
};

const PolicyBlock = ({ block }) => {
  if (block.type === "heading" && block.depth === 3) {
    return (
      <h3 className="pt-2 text-lg font-black text-slate-800">
        {renderInlineText(block.text)}
      </h3>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="list-disc space-y-2 pl-5">
        {block.items.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineText(item)}</li>
        ))}
      </ul>
    );
  }

  return <p>{renderInlineText(block.text)}</p>;
};

const PolicySection = ({ title, children }) => (
  <section className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] max-[640px]:p-5">
    <h2 className="mb-4 text-2xl font-black text-slate-900">{title}</h2>
    <div className="space-y-3 text-sm leading-7 font-semibold text-slate-600">
      {children}
    </div>
  </section>
);

const PolicyContentGroup = ({ children }) => (
  <article className="rounded-[28px] border border-indigo-100 bg-indigo-50/80 p-6 shadow-[0_18px_46px_rgba(15,23,42,0.06)] max-[640px]:p-5">
    <div className="space-y-3 text-sm leading-7 font-semibold text-slate-700">
      {children}
    </div>
  </article>
);

const PolicyDocument = ({ ariaLabel, eyebrow, fallbackTitle, markdown }) => {
  const policy = parsePolicyMarkdown({ fallbackTitle, markdown });

  return (
    <section className="grid gap-5" aria-label={ariaLabel}>
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] max-[640px]:p-6">
        <p className="mb-2 text-xs font-black tracking-[0.14em] text-indigo-200 uppercase">
          {eyebrow}
        </p>
        <h1 className="text-[34px] leading-tight font-black max-[640px]:text-[28px]">
          {policy.title}
        </h1>
      </div>

      {policy.groups.map((group, groupIndex) => {
        const blocks = group.blocks.map((block, blockIndex) => (
          <PolicyBlock
            block={block}
            key={`${groupIndex}-${block.type}-${blockIndex}`}
          />
        ));

        if (group.type === "section") {
          return (
            <PolicySection
              title={group.title}
              key={`${group.title}-${groupIndex}`}
            >
              {blocks}
            </PolicySection>
          );
        }

        return (
          <PolicyContentGroup key={`content-${groupIndex}`}>
            {blocks}
          </PolicyContentGroup>
        );
      })}
    </section>
  );
};

export default PolicyDocument;
