#!/usr/bin/env bash
# Local MongoDB test servers for reproducing connectivity issues across versions.
# Plain mongod processes (no containers): binaries and data under ~/.local/share/mongo-matrix.
#
# Usage: scripts/mongo-matrix.sh start|stop|status [instance...]   (default: all)
# Auth instances use root user admin/admin; m80rs is a single-node replica set without auth.
set -euo pipefail

BASE="${MONGO_MATRIX_HOME:-$HOME/.local/share/mongo-matrix}"

# name:version:port:mode
INSTANCES=(
  "m42:4.2.5:27042:auth"
  "m60:6.0.29:27060:auth"
  "m70:7.0.43:27070:auth"
  "m80:8.0.32:27080:auth"
  "m80rs:8.0.32:27081:rs"
)

lookup() {
  local entry
  for entry in "${INSTANCES[@]}"; do
    [[ "${entry%%:*}" == "$1" ]] && { echo "$entry"; return; }
  done
  echo "unknown instance: $1" >&2; exit 1
}

wait_ping() {
  local port=$1 i
  for i in $(seq 1 30); do
    mongosh --quiet --port "$port" --eval 'db.runCommand({ping:1}).ok' >/dev/null 2>&1 && return 0
    sleep 1
  done
  echo "port $port did not respond" >&2; return 1
}

start_one() {
  IFS=: read -r name version port mode <<<"$(lookup "$1")"
  local dir="$BASE/data/$name" bin="$BASE/$version/mongod"
  if [[ -f "$dir/mongod.pid" ]] && kill -0 "$(cat "$dir/mongod.pid")" 2>/dev/null; then
    echo "$name already running (port $port)"; return
  fi
  mkdir -p "$dir/db"
  local args=(--dbpath "$dir/db" --port "$port" --bind_ip 127.0.0.1
    --logpath "$dir/mongod.log" --logappend --pidfilepath "$dir/mongod.pid" --fork)
  if [[ "$mode" == rs ]]; then args+=(--replSet rs0); else args+=(--auth); fi
  "$bin" "${args[@]}" >/dev/null
  wait_ping "$port"

  if [[ ! -f "$dir/.initialized" ]]; then
    if [[ "$mode" == rs ]]; then
      mongosh --quiet --port "$port" --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:$port'}]})" >/dev/null
    else
      # localhost exception: first user can be created while --auth is on
      mongosh --quiet --port "$port" admin --eval "db.createUser({user:'admin',pwd:'admin',roles:['root']})" >/dev/null
    fi
    touch "$dir/.initialized"
  fi
  echo "$name started: mongod $version on port $port ($mode)"
}

stop_one() {
  IFS=: read -r name version port mode <<<"$(lookup "$1")"
  local pidfile="$BASE/data/$name/mongod.pid"
  if [[ -f "$pidfile" ]] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
    local pid i
    pid="$(cat "$pidfile")"
    kill "$pid"
    for i in $(seq 1 30); do kill -0 "$pid" 2>/dev/null || break; sleep 1; done
    echo "$name stopped"
  else
    echo "$name not running"
  fi
}

status_one() {
  IFS=: read -r name version port mode <<<"$(lookup "$1")"
  local pidfile="$BASE/data/$name/mongod.pid" state="stopped"
  [[ -f "$pidfile" ]] && kill -0 "$(cat "$pidfile")" 2>/dev/null && state="running"
  printf '%-6s %-7s %-6s %-5s %s\n' "$name" "$version" "$port" "$mode" "$state"
}

cmd="${1:-status}"; shift || true
names=("$@")
if [[ ${#names[@]} -eq 0 ]]; then
  for entry in "${INSTANCES[@]}"; do names+=("${entry%%:*}"); done
fi

case "$cmd" in
  start)  for n in "${names[@]}"; do start_one "$n"; done ;;
  stop)   for n in "${names[@]}"; do stop_one "$n"; done ;;
  status) for n in "${names[@]}"; do status_one "$n"; done ;;
  *) echo "usage: $0 start|stop|status [instance...]" >&2; exit 1 ;;
esac
