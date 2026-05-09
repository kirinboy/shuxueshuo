# 部署

服务器上的仓库路径：**`/home/ronghao/code/shuxueshuo`**。对外站点根目录为仓库内的 **`site/`**，即 Nginx `root` 为 **`/home/ronghao/code/shuxueshuo/site`**。

## Nginx

1. 将站点配置复制到本机配置目录（路径因发行版可能略有差异，常见为 `conf.d`）：

   ```bash
   sudo cp /home/ronghao/code/shuxueshuo/deploy/nginx/shuxueshuo.conf /etc/nginx/conf.d/shuxueshuo.conf
   ```

2. 校验并重载：

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. 确保域名 **A 记录** 指向该服务器公网 IP。

配置模板见同目录下的 [`nginx/shuxueshuo.conf`](nginx/shuxueshuo.conf)。

## 更新站点文件

在服务器仓库目录内 `git pull`，或使用 rsync 只同步 `site/` 到 `/home/ronghao/code/shuxueshuo/site/`。示例（在本地仓库根目录执行，按需改用户与主机）：

```bash
rsync -avz --delete ./site/ ronghao@<服务器IP或域名>:/home/ronghao/code/shuxueshuo/site/
```

## HTTPS

证书就绪后，在同一 `server` 中增加 `listen 443 ssl`、证书与私钥路径，或使用 `certbot --nginx` 由工具改写配置。
