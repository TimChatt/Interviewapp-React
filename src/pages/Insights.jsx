import React, { useState } from "react";
import {
  Box, Heading, Stat, StatLabel, StatNumber, Grid, VStack, Input, Card, CardBody, Text
} from "@chakra-ui/react";
import {
  PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, LineChart, Line
} from "recharts";
import ashbyMockData from "../mockdata/ashbyMockData.json";

// Helper to parse date
const parseDate = (dateString) => dateString ? new Date(dateString) : null;

function Insights() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  const filteredData = ashbyMockData.filter((candidate) => {
    const interviewDT = parseDate(candidate.interviewDate);
    if (!interviewDT) return false;
    if (startDateObj && interviewDT < startDateObj) return false;
    if (endDateObj && interviewDT > endDateObj) return false;
    return true;
  });

  const totalCandidates = filteredData.length;
  const hiredCount = filteredData.filter((c) => c.status === "Hired").length;
  const archivedCount = filteredData.filter((c) => c.status === "Archived").length;

  const statusPieData = [
    { name: "Hired", value: hiredCount },
    { name: "Archived", value: archivedCount }
  ];

  const pieColors = ["#A0C4FF", "#FFADAD"];
  const lineChartColor = "#FFD700"; // Gold yellow for interviews over time

  // Interviews Over Time Calculation
  const monthlyCountMap = {};
  filteredData.forEach((candidate) => {
    const dt = parseDate(candidate.interviewDate);
    if (dt) {
      const monthKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      monthlyCountMap[monthKey] = (monthlyCountMap[monthKey] || 0) + 1;
    }
  });

  const monthlyData = Object.entries(monthlyCountMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // Average Scores by Skill
  const allSkillsSet = new Set();
  filteredData.forEach((candidate) => {
    if (candidate.scores) {
      Object.keys(candidate.scores).forEach((skill) => allSkillsSet.add(skill));
    }
  });

  const allSkills = Array.from(allSkillsSet);
  const skillColors = ["#A0C4FF", "#BDB2FF", "#FFC6FF", "#FFADAD", "#CAFFBF"];

  const skillAverages = allSkills.map((skill) => {
    let totalScore = 0;
    let count = 0;
    filteredData.forEach((candidate) => {
      if (candidate.scores && candidate.scores[skill] !== undefined) {
        totalScore += candidate.scores[skill];
        count++;
      }
    });
    return { skill, averageScore: count > 0 ? parseFloat((totalScore / count).toFixed(2)) : 0 };
  });

  return (
    <Box maxW="1000px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="gray.900" fontWeight="bold" mb="6">
        📊 Insights Dashboard
      </Heading>

      {/* Date Filters */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb="6">
        <VStack align="stretch">
          <Text fontSize="sm" fontWeight="bold">Start Date:</Text>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </VStack>
        <VStack align="stretch">
          <Text fontSize="sm" fontWeight="bold">End Date:</Text>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </VStack>
      </Grid>

      {/* Stats Overview */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb="8">
        <StatCard title="Total Candidates" value={totalCandidates} />
        <StatCard title="Hired" value={hiredCount} />
        <StatCard title="Archived" value={archivedCount} />
      </Grid>

      {/* PieChart: Hired vs. Archived */}
      <ChartSection title="Hired vs. Archived">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={statusPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {statusPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartSection>

      {/* Interviews Over Time (Line Chart) */}
      <ChartSection title="📅 Interviews Over Time">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke={lineChartColor} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </ChartSection>

      {/* Grouped Bar Chart for Skill Scores */}
      <ChartSection title="⭐ Team Fit & Other Scores">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={skillAverages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="skill" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            {allSkills.map((skill, index) => (
              <Bar key={skill} dataKey="averageScore" fill={skillColors[index % skillColors.length]} name={skill} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>
    </Box>
  );
}

// ✅ Updated StatCard with black number
const StatCard = ({ title, value }) => {
  return (
    <Card bg="white" shadow="md" borderRadius="lg">
      <CardBody>
        <Stat textAlign="center">
          <StatLabel fontSize="lg" color="gray.600">{title}</StatLabel>
          <StatNumber fontSize="3xl" color="gray.900">{value}</StatNumber>
        </Stat>
      </CardBody>
    </Card>
  );
};

// ✅ Updated ChartSection with black subheading
const ChartSection = ({ title, children }) => {
  return (
    <Card bg="white" shadow="md" borderRadius="lg" mb="8">
      <CardBody>
        <Heading size="md" textAlign="center" color="gray.900" fontWeight="semibold" mb="4">
          {title}
        </Heading>
        {children}
      </CardBody>
    </Card>
  );
};

export default Insights;
