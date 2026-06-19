---
title: 'Notes on building with large language models'
description: 'A few practical lessons I keep coming back to when shipping LLM-powered features.'
pubDate: 2026-05-02
tags: ['ai', 'llm', 'engineering']
draft: false
---

When building with large language models, a few principles consistently pay off.
Here are some notes I keep coming back to.

## 1. Start with evaluation

Before optimizing prompts or fine-tuning, build a small evaluation set. You
cannot improve what you cannot measure.

## 2. Keep humans in the loop

For high-stakes outputs, design review steps rather than fully automating.

```python
def summarize(text: str) -> str:
    # Replace with your model call
    return model.generate(prompt=f"Summarize:\n{text}")
```

## 3. Treat prompts as code

Version them, test them, and review changes like any other part of your system.

This is a placeholder post — swap it out with your own writing.
