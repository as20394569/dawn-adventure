#!/usr/bin/env python3
"""Top-level statement scanner for the game's src/*.js (one-off refactoring helper for the v11 battle rewrite).
usage: jsstmts.py list FILE [PATTERN]      -> print top-level statements whose text matches PATTERN (default Battle)
       jsstmts.py drop FILE START_LINE...   -> remove the top-level statements that start on those lines
Statements are split with a small JS lexer (strings, template literals, comments, regex literals, bracket depth)."""
import re, sys

def statements(src):
    i, n = 0, len(src)
    depth = 0; start = None; out = []
    prev_sig = ''  # last significant char (for regex detection)
    stack = []      # template literal nesting: depth at which ${ opened
    def flush(end):
        nonlocal start
        if start is not None and src[start:end].strip():
            out.append((start, end))
        start = None
    while i < n:
        c = src[i]
        if start is None and not c.isspace():
            start = i
        if c == '/' and i + 1 < n and src[i+1] == '/':
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if c == '/' and i + 1 < n and src[i+1] == '*':
            j = src.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c in '\'"':
            j = i + 1
            while j < n and src[j] != c:
                if src[j] == '\\': j += 1
                j += 1
            i = j + 1; prev_sig = 'a'; continue
        if c == '`' or (c == '}' and stack and stack[-1] == depth):
            if c == '}': stack.pop()
            j = i + 1
            while j < n:
                if src[j] == '\\': j += 2; continue
                if src[j] == '`': break
                if src[j] == '$' and j + 1 < n and src[j+1] == '{':
                    stack.append(depth); j += 2; break
                j += 1
            else:
                pass
            if j < n and src[j] == '`': i = j + 1; prev_sig = 'a'; continue
            i = j; prev_sig = '('; continue
        if c == '/':
            # regex literal if previous significant char can't end an expression
            if prev_sig in '' or prev_sig in '(,=:[!&|?{};+-*%<>~^' or re.search(r'(return|typeof|case|in|of)\s*$', src[max(0, i-8):i]):
                j = i + 1; cls = False
                while j < n:
                    ch = src[j]
                    if ch == '\\': j += 2; continue
                    if ch == '[': cls = True
                    elif ch == ']': cls = False
                    elif ch == '/' and not cls: break
                    elif ch == '\n': break
                    j += 1
                j += 1
                while j < n and src[j].isalpha(): j += 1
                i = j; prev_sig = 'a'; continue
        if c in '([{': depth += 1
        elif c in ')]}':
            depth -= 1
            if depth == 0 and c == '}':
                # a block / function body closed at top level: the statement ends here unless the line continues
                k = i + 1
                while k < n and src[k] in ' \t': k += 1
                if k >= n or src[k] == '\n' or src[k] == ';':
                    if k < n and src[k] == ';': k += 1
                    i = k; prev_sig = ';'; flush(i); continue
        elif c == ';' and depth == 0:
            i += 1; prev_sig = ';'; flush(i); continue
        elif c == '\n' and depth == 0 and start is not None:
            # ASI for single-line statements without a semicolon
            seg = src[start:i].strip()
            if seg and not seg.endswith((',', '=', '(', '+', '?', ':', '&&', '||')):
                nxt = src[i+1:i+40].lstrip()
                if not nxt.startswith(('.', '?', ':', '+', '&&', '||', ')', ']')):
                    flush(i); i += 1; continue
        if not c.isspace(): prev_sig = c if not (c.isalnum() or c in '_$') else 'a'
        i += 1
    flush(n)
    return out

def line_of(src, pos): return src.count('\n', 0, pos) + 1

if __name__ == '__main__':
    cmd, f = sys.argv[1], sys.argv[2]
    src = open(f, encoding='utf-8').read(); st = statements(src)
    if cmd == 'list':
        pat = re.compile(sys.argv[3] if len(sys.argv) > 3 else r'Battle\b')
        for a, b in st:
            t = src[a:b]
            if pat.search(t):
                print(f'{line_of(src, a)}-{line_of(src, b)} ({b-a}c): ' + re.sub(r'\s+', ' ', t[:150]))
    elif cmd == 'drop':
        lines = set(int(x) for x in sys.argv[3:]); keep = []; last = 0; dropped = []
        for a, b in st:
            if line_of(src, a) in lines:
                keep.append(src[last:a]); last = b; dropped.append(line_of(src, a))
                # eat the newline right after the statement
                if last < len(src) and src[last] == '\n': last += 1
        keep.append(src[last:]); open(f, 'w', encoding='utf-8').write(''.join(keep))
        print('dropped', sorted(dropped), 'missing', sorted(lines - set(dropped)))
    elif cmd == 'check':
        print(len(st), 'statements')
