---
title: How a Nostr Event ID Is Computed
subtitle: Why the ID is a commitment, not a name
description: The serialization NIP-01 hashes to produce an event ID, and what that buys you.
date: 2026-10-12
tags: [nostr, protocols, cryptography]
---

In Nostr, an event's `id` is not assigned by a relay or a database. It is derived from the
event's own contents, which is what makes events safe to pass between untrusted relays.

## The serialization

NIP-01 defines the ID as the SHA-256 of a UTF-8 JSON array built from six fields, in this
exact order:

```json
[
  0,
  "<pubkey, lowercase hex>",
  <created_at, number>,
  <kind, number>,
  <tags, array of arrays>,
  "<content, string>"
]
```

So, writing $S$ for that serialized array:

$$\text{id} = \operatorname{SHA256}(S)$$

```go
func EventID(e Event) [32]byte {
	serialized, _ := json.Marshal([]any{
		0, e.PubKey, e.CreatedAt, e.Kind, e.Tags, e.Content,
	})
	return sha256.Sum256(serialized)
}
```

## Why it matters

Because the ID commits to every field, including `pubkey` and `created_at`, a relay cannot
alter an event without invalidating it. Any client can recompute the hash and check it,
which means **you never have to trust the relay that handed you the event** — only the
signature over the ID.

The consequence worth internalising: an event ID is a *commitment*, not an identifier you
are free to assign. Change one byte of `content` and you do not have a modified event, you
have a different event. There is no edit — only a new event that supersedes the old one.

> This is the same property that makes the protocol's relay model work at all. Relays are
> interchangeable because none of them is trusted to be authoritative.

## The usual mistake

The serialization has to be byte-exact. Re-ordering the fields, pretty-printing the JSON,
or letting a language's default marshaller escape characters differently will all produce
a valid-looking hash that no one else agrees with. If your IDs do not match other
implementations, compare the serialized bytes before you look anywhere else.
