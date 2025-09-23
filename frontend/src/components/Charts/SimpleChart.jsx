import React from "react";
import "./Charts.css";

const SimpleChart = ({ data, type = "bar", title, height = 200 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="chart-container">
                {title && <h3 className="chart-title">{title}</h3>}
                <div className="chart-no-data">No data available</div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map((item) => item.value)) || 1; // Prevent division by zero

    const renderBarChart = () => (
        <div className="bar-chart" style={{ height }}>
            {data.map((item, index) => {
                const barHeight = Math.max((item.value / maxValue) * 70, 8); // Minimum 8% height, max 70%
                return (
                    <div key={index} className="bar-item">
                        <div className="bar-container">
                            <div
                                className="bar"
                                style={{
                                    height: `${barHeight}%`,
                                    backgroundColor:
                                        item.color || "var(--primary)",
                                }}
                                title={`${item.label}: ${item.value}%`}
                            />
                        </div>
                        <span className="bar-label">{item.label}</span>
                        <span className="bar-value">{item.value}%</span>
                    </div>
                );
            })}
        </div>
    );

    const renderLineChart = () => (
        <div className="line-chart" style={{ height }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200">
                <polyline
                    points={data
                        .map(
                            (item, index) =>
                                `${(data.length > 1 ? (index / (data.length - 1)) : 0.5) * 380 + 10},${
                                    190 - (item.value / maxValue) * 170
                                }`
                        )
                        .join(" ")}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                />
                {data.map((item, index) => (
                    <circle
                        key={index}
                        cx={(data.length > 1 ? (index / (data.length - 1)) : 0.5) * 380 + 10}
                        cy={190 - (item.value / maxValue) * 170}
                        r="4"
                        fill="var(--primary)"
                        title={`${item.label}: ${item.value}`}
                    />
                ))}
            </svg>
            <div className="line-chart-labels">
                {data.map((item, index) => (
                    <span key={index} className="line-label">
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );

    const renderDonutChart = () => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let cumulativePercentage = 0;

        return (
            <div className="donut-chart" style={{ height }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const startAngle = (cumulativePercentage / 100) * 360;
                        const endAngle =
                            ((cumulativePercentage + percentage) / 100) * 360;

                        const x1 =
                            100 +
                            70 * Math.cos(((startAngle - 90) * Math.PI) / 180);
                        const y1 =
                            100 +
                            70 * Math.sin(((startAngle - 90) * Math.PI) / 180);
                        const x2 =
                            100 +
                            70 * Math.cos(((endAngle - 90) * Math.PI) / 180);
                        const y2 =
                            100 +
                            70 * Math.sin(((endAngle - 90) * Math.PI) / 180);

                        const largeArcFlag = percentage > 50 ? 1 : 0;

                        const pathData = [
                            `M 100 100`,
                            `L ${x1} ${y1}`,
                            `A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            "Z",
                        ].join(" ");

                        cumulativePercentage += percentage;

                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill={
                                    item.color || `hsl(${index * 60}, 70%, 50%)`
                                }
                                title={`${item.label}: ${
                                    item.value
                                } (${percentage.toFixed(1)}%)`}
                            />
                        );
                    })}
                    <circle cx="100" cy="100" r="40" fill="var(--bg-primary)" />
                </svg>
                <div className="donut-legend">
                    {data.map((item, index) => (
                        <div key={index} className="legend-item">
                            <div
                                className="legend-color"
                                style={{
                                    backgroundColor:
                                        item.color ||
                                        `hsl(${index * 60}, 70%, 50%)`,
                                }}
                            />
                            <span>
                                {item.label}: {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="chart-container">
            {title && <h3 className="chart-title">{title}</h3>}
            {type === "bar" && renderBarChart()}
            {type === "line" && renderLineChart()}
            {type === "donut" && renderDonutChart()}
        </div>
    );
};

export default SimpleChart;
