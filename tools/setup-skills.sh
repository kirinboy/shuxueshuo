#!/usr/bin/env bash
# setup-skills.sh
# 将仓库里的 skill 目录符号链接到 ~/.codex/skills/，使 Cursor Agent 能读取它们。
# 每个协作者 clone 仓库后运行一次即可。
#
# 用法：
#   bash tools/setup-skills.sh
#   bash tools/setup-skills.sh --dry-run   # 只显示将要执行的操作，不实际执行

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_SRC="$REPO_ROOT/internal/skills"
SKILLS_DST="$HOME/.codex/skills"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "[dry-run] 不会实际修改文件系统"
fi

# 确保目标父目录存在
if [[ "$DRY_RUN" == false ]]; then
  mkdir -p "$SKILLS_DST"
fi

link_count=0
skip_count=0

for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name="$(basename "$skill_dir")"
  src="$SKILLS_SRC/$skill_name"
  dst="$SKILLS_DST/$skill_name"

  if [[ -L "$dst" ]]; then
    current_target="$(readlink "$dst")"
    if [[ "$current_target" == "$src" ]]; then
      echo "  已是最新  $dst -> $src"
      ((skip_count++)) || true
      continue
    else
      echo "  更新链接  $dst"
      echo "    旧目标: $current_target"
      echo "    新目标: $src"
      if [[ "$DRY_RUN" == false ]]; then
        rm "$dst"
        ln -s "$src" "$dst"
      fi
      ((link_count++)) || true
    fi
  elif [[ -d "$dst" && ! -L "$dst" ]]; then
    echo "  ⚠ 警告: $dst 是普通目录（非链接），跳过。"
    echo "    如需覆盖，请先手动备份并删除该目录，再重新运行本脚本。"
    ((skip_count++)) || true
  else
    echo "  创建链接  $dst -> $src"
    if [[ "$DRY_RUN" == false ]]; then
      ln -s "$src" "$dst"
    fi
    ((link_count++)) || true
  fi
done

echo ""
if [[ "$DRY_RUN" == true ]]; then
  echo "Dry-run 完成：$link_count 个将创建/更新，$skip_count 个将跳过。"
else
  echo "完成：$link_count 个已创建/更新，$skip_count 个已是最新或跳过。"
fi
