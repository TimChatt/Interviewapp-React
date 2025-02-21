import React, { useState, useEffect } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Select, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompetencyDashboard = () => {
  const [competencyHistory, setCompetencyHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [selectedCompetency, setSelectedCompetency] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchRecentChanges();
  }, []);

  const fetchRecentChanges = async () => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/get-trends-over-time");
      if (!response.ok) throw new Error("Failed to fetch competency trends");
      const data = await response.json();
      setTrends(data.trends || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetencyHistory = async (competency) => {
    setLoading(true);
    try {
      const response = await fetch(`https://interviewappbe-production.up.railway.app/api/get-competency-history/${competency}`);
      if (!response.ok) throw new Error("Failed to fetch competency history");
      const data = await response.json();
      setCompetencyHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

      {/* Dropdown to select a competency */}
      <Select placeholder="Select a competency" onChange={(e) => {
        setSelectedCompetency(e.target.value);
        fetchCompetencyHistory(e.target.value);
      }}>
        {Array.from(new Set(trends.map(item => item.competency_name))).map(competency => (
          <option key={competency} value={competency}>{competency}</option>
        ))}
      </Select>

      {/* Table of competency changes */}
      <Table variant="simple" mt="6">
        <Thead>
          <Tr>
            <Th>Competency</Th>
            <Th>Job Title</Th>
            <Th>Job Level</Th>
            <Th>Change Type</Th>
            <Th>Old Value</Th>
            <Th>New Value</Th>
            <Th>Date Changed</Th>
          </Tr>
        </Thead>
        <Tbody>
          {competencyHistory.map((change, index) => (
            <Tr key={index}>
              <Td>{change.competency_name}</Td>
              <Td>{change.job_title}</Td>
              <Td>{change.job_level}</Td>
              <Td>{change.change_type}</Td>
              <Td>{change.old_value}</Td>
              <Td>{change.new_value}</Td>
              <Td>{new Date(change.date_changed).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Line Chart for Trends */}
      <Box mt="8" height="400px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date_changed" tickFormatter={(tick) => new Date(tick).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="change_type" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default CompetencyDashboard;
