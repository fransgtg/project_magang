import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import useSessionState from '../hooks/useSessionState';

const HorasPage = () => {
    const { showToast } = useOutletContext(); // Mendapatkan fungsi showToast dari Layout
    const [dataHoras, setDataHoras] = useState([]);
    const [isLoadingHoras, setIsLoadingHoras] = useState(false);
    
    // States
    const [pageHoras, setPageHoras] = useSessionState('pageHoras', 0);
    const [searchHoras, setSearchHoras] = useSessionState('searchHoras', "");
    const [previousPageHoras, setPreviousPageHoras] = useSessionState('previousPageHoras', 0);
    const [filterRegionalHoras, setFilterRegionalHoras] = useSessionState('filterRegionalHoras', "");
    const [filterBranchHoras, setFilterBranchHoras] = useSessionState('filterBranchHoras', "");
    const [filterStatusHoras, setFilterStatusHoras] = useSessionState('filterStatusHoras', "");
    const [pageSizeHoras, setPageSizeHoras] = useSessionState('pageSizeHoras', 10);
    const [totalPageHoras, setTotalPageHoras] = useState(0);
    
    const [selectedRows, setSelectedRows] = useState(new Map());

    const fetchHoras = async () => {
        setIsLoadingHoras(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/horas?page=${pageHoras}&size=${pageSizeHoras}&search=${searchHoras}&regional=${filterRegionalHoras}&branch=${filterBranchHoras}&status=${filterStatusHoras}`);
            setDataHoras(res.data.content);
            setTotalPageHoras(res.data.totalPages);
        } catch (error) {
            console.error("Error fetch Horas:", error);
        } finally {
            setIsLoadingHoras(false);
        }
    };

    useEffect(() => {
        fetchHoras();
    }, [pageHoras, pageSizeHoras, searchHoras, filterRegionalHoras, filterBranchHoras, filterStatusHoras]);

    const handleSync = async (row) => {
        const dataBaru = {
            id: row.idCluster,
            lop: row.namaLop,
            cham: row.cham,
            region: row.regional,
            branch: row.branch
        };

        try {
            const res = await axios.post("http://localhost:8080/api/sync-horas", dataBaru);
            if (res.status === 200) {
                showToast("Data berhasil disinkronisasi ke Tabel Manual!", "success");
                // Optimistic UI Update
                setDataHoras(prev => prev.map(item => item.idCluster === row.idCluster ? { ...item, status: 'ada' } : item));
            }
        } catch (error) {
            showToast("Gagal sinkronisasi data.", "error");
            console.error(error);
        }
    };

    const availableRows = dataHoras.filter(row => row.status === 'tidak ada');
    const allVisibleSelected = availableRows.length > 0 && availableRows.every(row => selectedRows.has(row.idCluster));

    const handleSelectAll = (e) => {
        const newSelected = new Map(selectedRows);
        if (e.target.checked) {
            availableRows.forEach(row => newSelected.set(row.idCluster, row));
        } else {
            availableRows.forEach(row => newSelected.delete(row.idCluster));
        }
        setSelectedRows(newSelected);
    };

    const handleSelectRow = (row, checked) => {
        const newSelected = new Map(selectedRows);
        if (checked) {
            newSelected.set(row.idCluster, row);
        } else {
            newSelected.delete(row.idCluster);
        }
        setSelectedRows(newSelected);
    };

    const handleBulkSync = async () => {
        if (selectedRows.size === 0) return;
        
        const payload = Array.from(selectedRows.values()).map(row => ({
            id: row.idCluster,
            lop: row.namaLop,
            cham: row.cham,
            region: row.regional,
            branch: row.branch
        }));

        try {
            const res = await axios.post("http://localhost:8080/api/sync-horas-bulk", payload);
            if (res.status === 200) {
                const count = selectedRows.size;
                showToast(`Berhasil sinkronisasi ${count} data!`, "success");
                
                // Optimistic UI Update
                setDataHoras(prev => prev.map(item => selectedRows.has(item.idCluster) ? { ...item, status: 'ada' } : item));
                setSelectedRows(new Map()); 
            }
        } catch (error) {
            showToast("Gagal melakukan sinkronisasi.", "error");
            console.error(error);
        }
    };

    return (
        <div className="card" style={{ marginTop: '20px' }}>
            <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>Tabel Data Horas</h2>
                    {selectedRows.size > 0 && (
                        <button className="btn-primary" onClick={handleBulkSync} style={{ marginBottom: '20px', backgroundColor: '#058f44' }}>
                            Sinkronkan Terpilih ({selectedRows.size})
                        </button>
                    )}
                </div>
                <div className="entry-select-container" style={{ marginBottom: 0 }}>
                    <label>Tampilkan: </label>
                    <select className="input-field" value={pageSizeHoras} onChange={(e) => { setPageSizeHoras(Number(e.target.value)); setPageHoras(0); }}>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
            
            <div className="filter-container">
                <input 
                    type="text" 
                    className="input-field"
                    placeholder="Cari nama LoP..." 
                    value={searchHoras} 
                    onChange={(e) => {
                        const newVal = e.target.value;
                        if (newVal !== "" && searchHoras === "") setPreviousPageHoras(pageHoras);
                        setSearchHoras(newVal);
                        setPageHoras(newVal === "" ? previousPageHoras : 0);
                    }} 
                    style={{ flex: '1', minWidth: '200px' }}
                />
                <input 
                    type="text" 
                    className="input-field"
                    placeholder="Filter Regional..." 
                    value={filterRegionalHoras} 
                    onChange={(e) => { setFilterRegionalHoras(e.target.value); setPageHoras(0); }} 
                />
                <input 
                    type="text" 
                    className="input-field"
                    placeholder="Filter Branch..." 
                    value={filterBranchHoras} 
                    onChange={(e) => { setFilterBranchHoras(e.target.value); setPageHoras(0); }} 
                />
                <select 
                    className="input-field"
                    value={filterStatusHoras} 
                    onChange={(e) => { setFilterStatusHoras(e.target.value); setPageHoras(0); }} 
                >
                    <option value="">Semua Status</option>
                    <option value="ada">Ada</option>
                    <option value="tidak ada">Tidak Ada</option>
                </select>
            </div>

            {isLoadingHoras ? (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={allVisibleSelected}
                                        onChange={handleSelectAll}
                                        disabled={availableRows.length === 0}
                                        style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                    />
                                </th>
                                <th>ID CLUSTER</th>
                                <th>NAMA LOP</th>
                                <th>REGIONAL</th>
                                <th>BRANCH</th>
                                <th>CHAM</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataHoras.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data.</td>
                                </tr>
                            ) : (
                                dataHoras.map((row) => {
                                    const isAda = row.status.toLowerCase() === 'ada';
                                    return (
                                        <tr key={row.idCluster}>
                                            <td>
                                                {!isAda && (
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedRows.has(row.idCluster)}
                                                        onChange={(e) => handleSelectRow(row, e.target.checked)}
                                                        style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                                    />
                                                )}
                                            </td>
                                            <td>{row.idCluster}</td>
                                            <td>{row.namaLop}</td>
                                            <td>{row.regional}</td>
                                            <td>{row.branch}</td>
                                            <td>{row.cham}</td>
                                            <td>
                                                <span className={`badge ${isAda ? 'ada' : 'tidak-ada'}`}>
                                                    {row.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {isAda ? (
                                                    <span className="badge selesai">SELESAI</span>
                                                ) : (
                                                    <button className="btn-primary" onClick={() => handleSync(row)}>
                                                        Masukkan ke Manual
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="pagination">
                <button 
                    className="btn-page"
                    disabled={pageHoras === 0} 
                    onClick={() => setPageHoras(pageHoras - 1)}
                >
                    &laquo; Prev
                </button>
                
                <div className="page-numbers" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {(() => {
                        let pages = [];
                        let startPage = Math.max(0, pageHoras - 2);
                        let endPage = Math.min(Math.max(0, totalPageHoras - 1), pageHoras + 2);

                        if (startPage > 0) {
                            pages.push(<button key={0} className="btn-page" onClick={() => setPageHoras(0)}>1</button>);
                            if (startPage > 1) pages.push(<span key="e1">...</span>);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                                <button 
                                    key={i} 
                                    className={`btn-page ${pageHoras === i ? 'active' : ''}`} 
                                    onClick={() => setPageHoras(i)}
                                    style={pageHoras === i ? { backgroundColor: 'var(--primary-red)', color: 'white', borderColor: 'var(--primary-red)' } : {}}
                                >
                                    {i + 1}
                                </button>
                            );
                        }

                        if (endPage < totalPageHoras - 1) {
                            if (endPage < totalPageHoras - 2) pages.push(<span key="e2">...</span>);
                            pages.push(<button key={totalPageHoras - 1} className="btn-page" onClick={() => setPageHoras(totalPageHoras - 1)}>{totalPageHoras}</button>);
                        }

                        return pages.length > 0 ? pages : <button className="btn-page active" style={{ backgroundColor: 'var(--primary-red)', color: 'white' }}>1</button>;
                    })()}
                </div>

                <button 
                    className="btn-page"
                    disabled={pageHoras >= totalPageHoras - 1 || totalPageHoras === 0} 
                    onClick={() => setPageHoras(pageHoras + 1)}
                >
                    Next &raquo;
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lompat ke:</span>
                    <input 
                        type="number" 
                        min={1} 
                        max={totalPageHoras}
                        className="input-field"
                        style={{ width: '60px', padding: '4px 8px', height: 'auto', textAlign: 'center' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                let val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1 && val <= totalPageHoras) {
                                    setPageHoras(val - 1);
                                }
                                e.target.value = '';
                            }
                        }}
                        placeholder="..."
                    />
                </div>
            </div>
        </div>
    );
};

export default HorasPage;