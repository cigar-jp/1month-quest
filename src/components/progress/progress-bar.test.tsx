import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "./progress-bar";

describe("ProgressBar", () => {
  it("パーセンテージを正しく計算して表示する", () => {
    render(<ProgressBar completed={3} total={10} />);
    
    expect(screen.getByText("3/10 (30%)")).toBeInTheDocument();
  });

  it("完了数が0の場合、0%を表示する", () => {
    render(<ProgressBar completed={0} total={10} />);
    
    expect(screen.getByText("0/10 (0%)")).toBeInTheDocument();
  });

  it("総数が0の場合、0%を表示する", () => {
    render(<ProgressBar completed={0} total={0} />);
    
    expect(screen.getByText("0/0 (0%)")).toBeInTheDocument();
  });

  it("100%完了時に完了メッセージを表示する", () => {
    render(<ProgressBar completed={10} total={10} />);
    
    expect(screen.getByText("10/10 (100%)")).toBeInTheDocument();
    expect(screen.getByText("完了!")).toBeInTheDocument();
  });

  it("カスタムラベルを表示する", () => {
    render(<ProgressBar completed={5} total={10} label="カスタムラベル" />);
    
    expect(screen.getByText("カスタムラベル")).toBeInTheDocument();
  });

  it("進捗率に応じて適切な色クラスを適用する", () => {
    const { container } = render(<ProgressBar completed={8} total={10} />);
    
    // 80%なので緑色のクラスが適用される
    const progressBar = container.querySelector(".bg-green-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("60%以上80%未満の場合、黄色クラスを適用する", () => {
    const { container } = render(<ProgressBar completed={7} total={10} />);
    
    const progressBar = container.querySelector(".bg-yellow-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("40%以上60%未満の場合、オレンジクラスを適用する", () => {
    const { container } = render(<ProgressBar completed={5} total={10} />);
    
    const progressBar = container.querySelector(".bg-orange-500");
    expect(progressBar).toBeInTheDocument();
  });

  it("40%未満の場合、赤色クラスを適用する", () => {
    const { container } = render(<ProgressBar completed={2} total={10} />);
    
    const progressBar = container.querySelector(".bg-red-500");
    expect(progressBar).toBeInTheDocument();
  });
});