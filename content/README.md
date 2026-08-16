# Your content

Everything in this folder is yours — the site reads from here. It lives outside
`web/` so that rebuilding, re-running setup, or resetting the site never touches
your work.

```
content/
  portfolio/<project>/     project.json + cover.jpg + assets/
  blog/<post>/             post.json + content.md + cover.jpg
  store/<product>/         product.json + cover.jpg + images/
```

The folder name is the URL: `content/portfolio/example-project/` is served at
`/project/example-project`.

## Adding work

Ask Claude for `/add-project`, `/add-blog-post`, or `/setup-shop` and it will
create the folders and metadata for you. Or do it by hand — nothing is generated,
it is all plain files.

## How images are found

Drop images into a project's `assets/` folder (or a product's `images/` folder)
and they appear automatically, sorted by filename. Name them `image-01.jpg`,
`image-02.jpg` … to control the order.

`cover.jpg` beside `project.json` becomes the thumbnail. Supported formats:
`jpg`, `jpeg`, `png`, `gif`, `webp`, `avif`.

To caption images or set their order explicitly, list them in `project.json`
under `media` — see `example-project` for a worked example.

## The examples

`example-project`, `example-series`, `example-print`, and the two starter blog
posts are placeholders. Replace them with your own work and delete what you do
not need — they are only here to show the shape of things.
