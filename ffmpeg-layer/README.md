FFMPEG Lambda layer is created separately from the main app stack.

To modify the layer you need first to create the layer folder with the commands:

```sh
curl -O https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz
tar xf ffmpeg-git-amd64-static.tar.xz
rm ffmpeg-git-amd64-static.tar.xz
mv ffmpeg-git-*-amd64-static layer
```

And then make the modifications in the `serverless.yml` file and deploy it with `sls deploy`.
