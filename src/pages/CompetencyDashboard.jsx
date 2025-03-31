import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Collapse,
} from "@chakra-ui/react";

const CompetencyDashboard = () => {
  const [competencyHistory, setCompetencyHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [selectedCompetency, setSelectedCompetency] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchRecentChanges();
  }, []);

  const fetchRecentChanges = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/get-trends-over-time");
      if (!response.ok) throw new Error(`❌ Failed to fetch competency trends (${response.status})`);

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
    setError(null);
    setCompetencyHistory([]);

    if (!competency) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://interviewappbe-production.up.railway.app/api/get-competency-history/${competency}`
      );
      if (!response.ok) throw new Error(`❌ Failed to fetch competency history (${response.status})`);

      const data = await response.json();
      setCompetencyHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="gray.900" fontWeight="bold" mb="6">
        Competency Evolution Dashboard
      </Heading>

      {error && (
        <Alert status="error" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading && <Spinner size="xl" color="purple.500" />}

      {/* ✅ Search Input */}
      <Input
        placeholder="Search competency..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb="4"
      />

      {/* ✅ Competency Selector */}
      <Select
        placeholder="Select a competency"
        onChange={(e) => {
          const selected = e.target.value;
          setSelectedCompetency(selected);
          fetchCompetencyHistory(selected);
        }}
        value={selectedCompetency}
      >
        {Array.from(new Set(trends.map((item) => item.competency_name))).map((competency) => (
          <option key={competency} value={competency}>
            {competency}
          </option>
        ))}
      </Select>

      {/* ✅ Competency History Table */}
      <Table variant="simple" mt="6">
        <Thead>
          <Tr>
            <Th>Competency</Th>
            <Th>Job Title</Th>
            <Th>New Score</Th>
            <Th>Date Changed</Th>
          </Tr>
        </Thead>
        <Tbody>
          {competencyHistory
            .filter((change) => change.competency_name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((change, index) => (
              <React.Fragment key={index}>
                <Tr
                  onClick={() => toggleRowExpansion(index)}
                  style={{ cursor: "pointer", background: expandedRows[index] ? "#f9f9f9" : "white" }}
                >
                  <Td>{change.competency_name}</Td>
                  <Td>{change.job_title}</Td>
                  <Td
                    style={{
                      color:
                        change.new_score > change.old_score
                          ? "green"
                          : change.new_score < change.old_score
                          ? "red"
                          : "gray",
                    }}
                  >
                    {change.new_score}
                  </Td>
                  <Td>{new Date(change.date_changed).toLocaleDateString()}</Td>
                </Tr>
                {expandedRows[index] && (
                  <Tr>
                    <Td colSpan={4}>
                      <Collapse in={expandedRows[index]}>
                        <Box p={4} bg="gray.50" borderRadius="md">
                          <strong>Job Level:</strong> {change.job_level}
                          <br />
                          <strong>Old Score:</strong> {change.old_score}
                          <br />
                          <strong>Change Type:</strong> {change.change_type}
                        </Box>
                      </Collapse>
                    </Td>
                  </Tr>
                )}
              </React.Fragment>
            ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CompetencyDashboard;
