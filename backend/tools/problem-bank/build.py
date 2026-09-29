"""Build backend/src/data/problems.json from the problem bank.

For every problem the reference Java solution is run through the real judge to produce expected outputs,
and each output is cross-checked against an independent Python solution. Run: python3 build.py
"""
import json, os, re, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import bank1, bank2, bank3  # noqa: E402

PROBLEMS = bank1.P + bank2.P + bank3.P
JUDGE_SRC = os.path.join(BACKEND, "judge")
env = {"PATH": os.environ["PATH"], "HOME": tempfile.gettempdir()}


def compile_harness(dest):
    files = [f for f in os.listdir(JUDGE_SRC) if f.endswith(".java")]
    subprocess.run(["javac", "-nowarn", "-d", dest] + files, cwd=JUDGE_SRC, check=True, env=env, capture_output=True)


def judge(classes, code, driver, inputs):
    work = tempfile.mkdtemp(prefix="bank-")
    try:
        user = os.path.join(work, "user")
        os.makedirs(user)
        m = re.search(r"public\s+class\s+(\w+)", code)
        fname = (m.group(1) if m else "Solution") + ".java"
        open(os.path.join(user, fname), "w").write(code)
        open(os.path.join(user, "CodeTrackDriver.java"), "w").write(driver)
        props = {"libDir": classes, "userDir": user, "userFiles": fname + ",CodeTrackDriver.java",
                 "userEntry": "CodeTrackDriver", "cases": len(inputs), "timeLimitMs": 10000, "wallLimitMs": 30000,
                 "resultFile": os.path.join(work, "result.jsonl")}
        os.makedirs(os.path.join(work, "cases"))
        for i, text in enumerate(inputs):
            p = os.path.join(work, "cases", f"{i}.in")
            open(p, "w").write(text + "\n")
            props[f"case.{i}"] = p
        open(os.path.join(work, "job.properties"), "w").write("\n".join(f"{k}={v}" for k, v in props.items()))
        subprocess.run(["java", "-Xmx512m", "-XX:+UseSerialGC", "-Djava.security.manager=allow", "-cp", classes,
                        "CodeTrackJudge", os.path.join(work, "job.properties")], env=env, capture_output=True, timeout=300)
        recs = [json.loads(l) for l in open(props["resultFile"]) if l.strip()]
        comp = recs[0]
        if not comp["ok"]:
            raise SystemExit(f"compile failed: {comp['errors']}")
        return [r for r in recs if r["type"] == "case"]
    finally:
        shutil.rmtree(work, ignore_errors=True)


def signatures(code):
    return set(re.findall(r"public\s+[\w<>\[\], ]+\s+\w+\s*\([^)]*\)", code))


def main():
    classes = tempfile.mkdtemp(prefix="bank-classes-")
    compile_harness(classes)
    out, failures = [], 0
    for idx, p in enumerate(PROBLEMS, 1):
        t0 = time.time()
        missing = signatures(p["template"]) - signatures(p["solution"])
        if missing:
            print(f"#{idx} {p['title']}: template signatures not in solution: {missing}")
            failures += 1
        inputs = [s["input"] for s in p["samples"]] + list(p["hidden"])
        results = judge(classes, p["solution"], p["driver"], inputs)
        if len(results) != len(inputs):
            raise SystemExit(f"#{idx} {p['title']}: only {len(results)}/{len(inputs)} cases ran")
        cases = []
        for i, (text, r) in enumerate(zip(inputs, results)):
            if r["status"] != "OK" or r["result"] is None:
                print(f"#{idx} {p['title']} case {i}: {r['status']} {r['error'][:300]}")
                failures += 1
                continue
            expected = p["py"](text.split("\n"))
            if expected != r["result"]:
                print(f"#{idx} {p['title']} case {i}: MISMATCH java={r['result'][:120]!r} python={expected[:120]!r}")
                failures += 1
            case = {"input": text, "output": r["result"], "hidden": i >= len(p["samples"])}
            if i < len(p["samples"]) and p["samples"][i].get("explanation"):
                case["explanation"] = p["samples"][i]["explanation"]
            cases.append(case)
        size = len(json.dumps(cases))
        print(f"#{idx:2} {p['title'][:34]:34} {len(cases)} cases ({len(p['samples'])} sample) {size/1024:7.1f} KB  {time.time()-t0:.1f}s")
        out.append({
            "title": p["title"], "description": p["description"], "category": p["category"],
            "difficulty": p["difficulty"], "tags": p["tags"], "paramNames": ",".join(p["params"]),
            "inputFormat": ", ".join(p["params"]), "outputFormat": "",
            "constraintsText": "\n".join(p["constraints"]),
            "sampleInput": cases[0]["input"], "sampleOutput": cases[0]["output"],
            "explanation": p["explanation"], "javaSolution": p["solution"], "defaultCodeTemplate": p["template"],
            "driverCode": p["driver"], "testCasesJson": json.dumps(cases, separators=(",", ":")),
            "timeComplexity": p["time"], "spaceComplexity": p["space"],
        })
    shutil.rmtree(classes, ignore_errors=True)
    if failures:
        raise SystemExit(f"{failures} problem(s) failed verification; problems.json not written")
    dest = os.path.join(BACKEND, "src", "data", "problems.json")
    json.dump(out, open(dest, "w"), indent=1, ensure_ascii=False)
    print(f"Wrote {len(out)} problems to {dest} ({os.path.getsize(dest)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
