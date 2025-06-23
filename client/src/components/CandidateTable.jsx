import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  TableContainer,
  Flex,
  Button,
} from "@chakra-ui/react";
import { ArrowUpIcon, ArrowDownIcon, SearchIcon } from "@chakra-ui/icons";

const CandidateTable = ({ candidates }) => {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();

  // 🔍 **Filter candidates by name**
  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name?.toLowerCase().includes(filter.toLowerCase())
  );

  // 🔄 **Sort candidates**
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const aValue = a[sortKey] || "";
    const bValue = b[sortKey] || "";

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <Box p={6} bg="white" shadow="md" borderRadius="lg">
      {/* 🔍 Search Bar */}
      <Flex mb={4} align="center">
        <Input
          placeholder="Search by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          bg="gray.100"
          width="300px"
          mr={2}
        />
        <SearchIcon color="gray.500" />
      </Flex>

      {/* 📊 Table Container */}
      <TableContainer>
        <Table variant="simple">
          <Thead bg="gray.100">
            <Tr>
              <Th cursor="pointer" onClick={() => handleSort("name")}>
                Name {sortKey === "name" && (sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("job_title")}>
                Job Title {sortKey === "job_title" && (sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("department")}>
                Department {sortKey === "department" && (sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("interview_stage")}>
                Interview Stage {sortKey === "interview_stage" && (sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("interview_date")}>
                Interview Date {sortKey === "interview_date" && (sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              </Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedCandidates.map((candidate) => (
              <Tr key={candidate.candidate_id} _hover={{ bg: "gray.50" }}>
                <Td>{candidate.name || "Unknown"}</Td>
                <Td>{candidate.job_title || "Unknown"}</Td>
                <Td>{candidate.department || "Unknown"}</Td>
                <Td>{candidate.interview_stage || "N/A"}</Td>
                <Td>
                  {candidate.interview_date !== "N/A"
                    ? new Date(candidate.interview_date).toLocaleDateString()
                    : "N/A"}
                </Td>
                <Td>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => navigate(`/candidates/${candidate.candidate_id}`)} // ✅ Ensured correct ID
                    disabled={!candidate.candidate_id} // 🚨 Prevents navigating if ID is missing
                  >
                    View
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CandidateTable;
