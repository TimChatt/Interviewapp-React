import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Button
} from "@chakra-ui/react";

const DepartmentFrameworkPage = () => {
  const { department } = useParams(); // Get department from URL
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-department-competencies/${department}`
        );
        if (!response.ok) throw new Error("Failed to fetch competencies.");
        const data = await response.json();
        setCompetencies(data.competencies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetencies();
  }, [department]);

  // Extract unique job titles
  const jobTitles = [...new Set(competencies.flatMap(c => c.job_titles))];

  // Filter competencies based on search
  const filteredCompetencies = competencies.filter(c =>
    c.competency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to export table data as CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Competency," + jobTitles.join(",") + "\n";

    filteredCompetencies.forEach(({ competency, job_titles }) => {
      const row = [competency, ...jobTitles.map(title => (job_titles.includes(title) ? "✓" : ""))];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${department}-competencies.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        {department} - Competency Framework
      </Heading>

      {loading && <Spinner size="xl" color="purple.500" />}
      {error && (
        <Alert status="error" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Search and Export Buttons */}
      <Box display="flex" justifyContent="space-between" mb="4">
        <Input
          placeholder="Search for a competency..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          width="300px"
        />
        <Button colorScheme="blue" onClick={handleExportCSV}>
          Export CSV
        </Button>
      </Box>

      {/* Competency Table */}
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Competency</Th>
            {jobTitles.map((title, idx) => (
              <Th key={idx}>{title}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {filteredCompetencies.map(({ competency, job_titles }, index) => (
            <Tr key={index}>
              <Td fontWeight="bold">{competency}</Td>
              {jobTitles.map((title, idx) => (
                <Td key={idx} textAlign="center">
                  {job_titles.includes(title) ? "✓" : ""}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default DepartmentFrameworkPage;
