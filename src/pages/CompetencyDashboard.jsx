import React, { useState, useEffect } from "react";
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Select, Spinner, Alert, AlertIcon, Button
} from "@chakra-ui/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const CompetencyDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [competencyHistory, setCompetencyHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [selectedCompetency, setSelectedCompetency] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrendPoint, setSelectedTrendPoint] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/get-departments");
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTrends = async (department) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/get-trends-over-time${department ? `?department=${department}` : ""}`
      );
      if (!response.ok) throw new Error("Failed to fetch competency trends");
      const data = await response.json();
      setTrends(predictFutureTrends(data || [])); // Add predicted data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetencyHistory = async (competency) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/get-competency-history/${competency}${selectedDepartment ? `?department=${selectedDepartment}` : ""}`
      );
      if (!response.ok) throw new Error("Failed to fetch competency history");
      const data = await response.json();
      setCompetencyHistory(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const predictFutureTrends = (data) => {
    if (data.length < 3) return data; // Need at least 3 data points for prediction
    const predictedTrends = [...data];
    const lastThreeScores = data.slice(-3).map(item => item.average_score);
    const predictedScore = lastThreeScores.reduce((a, b) => a + b, 0) / 3; // Simple moving average

    const lastDataPoint = data[data.length - 1];
    const nextMonth = lastDataPoint.month === 12 ? 1 : lastDataPoint.month + 1;
    const nextYear = lastDataPoint.month === 12 ? lastDataPoint.year + 1 : lastDataPoint.year;

    predictedTrends.push({
      competency_name: lastDataPoint.competency_name,
      month: nextMonth,
      year: nextYear,
      average_score: predictedScore,
      department: lastDataPoint.department,
      predicted: true,
    });

    return predictedTrends;
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Competency,Month,Year,Average Score,Department\n";
    trends.forEach(trend => {
      csvContent += `${trend.competency_name},${trend.month},${trend.year},${trend.average_score},${trend.department}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "competency_trends.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Competency Evolution Dashboard
      </Heading>

      {error && (
        <Alert status="error" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading && <Spinner size="xl" color="purple.500" />}

      {/* Department Filter */}
      <Select
        placeholder="Select a department"
        onChange={(e) => {
          setSelectedDepartment(e.target.value);
          fetchTrends(e.target.value);
        }}
        mb="4"
      >
        {departments.map((dept) => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </Select>

      {/* Competency Filter */}
      {selectedDepartment && (
        <Select
          placeholder="Select a competency"
          onChange={(e) => {
            setSelectedCompetency(e.target.value);
            fetchCompetencyHistory(e.target.value);
          }}
          mb="6"
        >
          {Array.from(new Set(trends.map(item => item.competency_name))).map(competency => (
            <option key={competency} value={competency}>{competency}</option>
          ))}
        </Select>
      )}

      {/* Export Button */}
      <Button colorScheme="blue" onClick={exportToCSV} mb="4">
        Export Trends to CSV
      </Button>

      {/* Table of competency changes */}
      {selectedCompetency && (
        <Table variant="simple" mt="6">
          <Thead>
            <Tr>
              <Th>Competency</Th>
              <Th>Job Title</Th>
              <Th>Job Level</Th>
              <Th>Old Score</Th>
              <Th>New Score</Th>
              <Th>Date Changed</Th>
            </Tr>
          </Thead>
          <Tbody>
            {competencyHistory.length > 0 ? (
              competencyHistory.map((change, index) => (
                <Tr key={index}>
                  <Td>{change.competency_name}</Td>
                  <Td>{change.job_title}</Td>
                  <Td>{change.job_level}</Td>
                  <Td>{change.old_value}</Td>
                  <Td>{change.new_value}</Td>
                  <Td>{new Date(change.date_changed).toLocaleDateString()}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan="6" textAlign="center">No historical changes available</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}

      {/* Line Chart for Trends */}
      {selectedDepartment && (
        <Box mt="8" height="400px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trends}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={(e) => setSelectedTrendPoint(e.activePayload?.[0]?.payload)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(tick, index) => {
                  const trend = trends[index];
                  return `${trend.month}/${trend.year}`;
                }}
              />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average_score" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
          {selectedTrendPoint && (
            <Alert status="info" mt="4">
              <AlertIcon />
              Selected Data: {selectedTrendPoint.competency_name} in {selectedTrendPoint.month}/{selectedTrendPoint.year} - Score: {selectedTrendPoint.average_score}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CompetencyDashboard;
