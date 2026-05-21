import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Renders a grammar note body. remark-gfm enables tables, which plain Markdown lacks. */
export function MarkdownNote({ body }: { body: string }) {
  return <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>;
}
