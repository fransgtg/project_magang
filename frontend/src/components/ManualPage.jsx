import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import useSessionState from '../hooks/useSessionState';
import Select from 'react-select';

const customSelectStyles = {
    control: (provided) => ({
        ...provided,
        backgroundColor: '#1a1a1a',
        borderColor: '#444',
        color: '#e0e0e0',
        minWidth: '200px',
        minHeight: '38px'
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#1a1a1a',
        border: '1px solid #444',
        zIndex: 999
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#333' : '#1a1a1a',
        color: '#e0e0e0',
        cursor: 'pointer'
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#e0e0e0'
    }),
    input: (provided) => ({
        ...provided,
        color: '#e0e0e0'
    })
};

const ManualPage = () => {
    const { showToast } = useOutletContext(); // Mendapatkan fungsi showToast dari Layout
    const [dataManual, setDataManual] = useState([]);
    const [isLoadingManual, setIsLoadingManual] = useState(false);
    
    // States
    const [pageManual, setPageManual] = useSessionState('pageManual', 0);
    const [searchManual, setSearchManual] = useSessionState('searchManual', "");
    const [previousPageManual, setPreviousPageManual] = useSessionState('previousPageManual', 0);
    const [filterRegionManual, setFilterRegionManual] = useSessionState('filterRegionManual', "");
    const [filterBranchManual, setFilterBranchManual] = useSessionState('filterBranchManual', "");
    const [pageSizeManual, setPageSizeManual] = useSessionState('pageSizeManual', 10);
    const [totalPageManual, setTotalPageManual] = useState(0);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({ id: '', lop: '', region: '', branch: '', cham: '' });

    // Dropdown Data States
    const [availableRegions, setAvailableRegions] = useState([]);
    const [availableBranches, setAvailableBranches] = useState([]);

    // Helper function for Title Case
    const toTitleCase = (str) => {
        if (!str) return "";
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    // Fetch Regions function
    const fetchRegions = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/manual/regions');
            const uniqueRegions = [...new Set(res.data.map(r => toTitleCase(r)))];
            setAvailableRegions(uniqueRegions);
        } catch (err) {
            console.error("Error fetch manual regions:", err);
        }
    };

    // Fetch Branches function
    const fetchBranches = async (region) => {
        try {
            const url = region 
                ? `http://localhost:8080/api/manual/branches?region=${encodeURIComponent(region)}`
                : `http://localhost:8080/api/manual/branches`;
            const res = await axios.get(url);
            const uniqueBranches = [...new Set(res.data.map(b => toTitleCase(b)))];
            setAvailableBranches(uniqueBranches);
        } catch (err) {
            console.error("Error fetch manual branches:", err);
        }
    };

    // Fetch Regions on component mount
    useEffect(() => {
        fetchRegions();
    }, []);

    // Fetch Branches when Regional filter changes
    useEffect(() => {
        fetchBranches(filterRegionManual);
        if (!filterRegionManual && filterBranchManual !== "") {
            setFilterBranchManual("");
        }
    }, [filterRegionManual]);

    const fetchManual = async () => {
        setIsLoadingManual(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/manual?page=${pageManual}&size=${pageSizeManual}&search=${searchManual}&region=${filterRegionManual}&branch=${filterBranchManual}`);
            setDataManual(res.data.content);
            setTotalPageManual(res.data.totalPages);
        } catch (error) {
            console.error("Error fetch Manual:", error);
        } finally {
            setIsLoadingManual(false);
        }
    };

    useEffect(() => {
        fetchManual();
    }, [pageManual, pageSizeManual, searchManual, filterRegionManual, filterBranchManual]);

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data ini dari Tabel Manual?")) {
            return;
        }
        
        try {
            const res = await axios.delete(`http://localhost:8080/api/manual?id=${encodeURIComponent(id)}`);
            if (res.status === 200) {
                showToast("Data berhasil dihapus dari Tabel Manual!", "success");
                fetchManual();
                fetchRegions();
                if (filterRegionManual) fetchBranches(filterRegionManual);
            }
        } catch (error) {
            showToast("Gagal menghapus data.", "error");
            console.error(error);
        }
    };

    const handleExport = () => {
        const url = `http://localhost:8080/api/manual/export?search=${encodeURIComponent(searchManual)}&region=${encodeURIComponent(filterRegionManual)}&branch=${encodeURIComponent(filterBranchManual)}`;
        window.open(url, '_blank');
    };

    const handleOpenModal = (mode, data = null) => {
        setModalMode(mode);
        if (mode === 'edit' && data) {
            setFormData(data);
        } else {
            setFormData({ id: '', lop: '', region: '', branch: '', cham: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await axios.post('http://localhost:8080/api/manual', formData);
                showToast("Data berhasil ditambahkan!", "success");
            } else if (modalMode === 'edit') {
                await axios.put(`http://localhost:8080/api/manual/${encodeURIComponent(formData.id)}`, formData);
                showToast("Data berhasil diperbarui!", "success");
            }
            setIsModalOpen(false);
            fetchManual();
            fetchRegions();
            if (filterRegionManual) fetchBranches(filterRegionManual);
        } catch (error) {
            showToast(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.", "error");
        }
    };

    return (
        <div className="card" style={{ marginTop: '20px' }}>
            <div className="flex-between" style={{ alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ margin: 0 }}>Tabel Data Manual</h2>
                    <button className="btn-secondary" onClick={() => handleOpenModal('add')}>
                        + Tambah Data
                    </button>
                    <button className="btn-export-beautiful" onClick={handleExport}>
                        <span className="export-icon-small"></span>
                        Export Data CSV
                    </button>
                </div>
                <div className="entry-select-container" style={{ marginBottom: 0 }}>
                    <label>Tampilkan: </label>
                    <select className="input-field" value={pageSizeManual} onChange={(e) => { setPageSizeManual(Number(e.target.value)); setPageManual(0); }}>
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
                    value={searchManual} 
                    onChange={(e) => {
                        const newVal = e.target.value;
                        if (newVal !== "" && searchManual === "") setPreviousPageManual(pageManual);
                        setSearchManual(newVal);
                        setPageManual(newVal === "" ? previousPageManual : 0);
                    }} 
                    style={{ flex: '1', minWidth: '200px' }}
                />
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <Select
                        styles={customSelectStyles}
                        placeholder="Filter Regional..."
                        value={filterRegionManual ? { value: filterRegionManual, label: filterRegionManual } : null}
                        onChange={(selectedOption) => { 
                            setFilterRegionManual(selectedOption ? selectedOption.value : ""); 
                            setPageManual(0); 
                        }}
                        options={[{ value: "", label: "Semua Region" }, ...availableRegions.map(r => ({ value: r, label: r }))]}
                        isClearable
                        isSearchable
                    />
                </div>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <Select
                        styles={customSelectStyles}
                        placeholder="Filter Branch..."
                        value={filterBranchManual ? { value: filterBranchManual, label: filterBranchManual } : null}
                        onChange={(selectedOption) => { 
                            setFilterBranchManual(selectedOption ? selectedOption.value : ""); 
                            setPageManual(0); 
                        }}
                        options={[{ value: "", label: "Semua Branch" }, ...availableBranches.map(b => ({ value: b, label: b }))]}
                        isClearable
                        isSearchable
                    />
                </div>
            </div>

            {isLoadingManual ? (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ borderTopLeftRadius: '6px' }}>ID</th>
                                <th>LOP</th>
                                <th>REGION</th>
                                <th>BRANCH</th>
                                <th>CHAM</th>
                                <th style={{ borderTopRightRadius: '6px' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataManual.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data.</td>
                                </tr>
                            ) : (
                                dataManual.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.id}</td>
                                        <td>{row.lop}</td>
                                        <td>{row.region}</td>
                                        <td>{row.branch}</td>
                                        <td>{row.cham}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => handleOpenModal('edit', row)}>
                                                Edit
                                            </button>
                                            <button className="btn-danger" onClick={() => handleDelete(row.id)}>
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="pagination">
                <button 
                    className="btn-page"
                    disabled={pageManual === 0} 
                    onClick={() => setPageManual(pageManual - 1)}
                >
                    &laquo; Prev
                </button>

                <div className="page-numbers" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {(() => {
                        let pages = [];
                        let startPage = Math.max(0, pageManual - 2);
                        let endPage = Math.min(Math.max(0, totalPageManual - 1), pageManual + 2);

                        if (startPage > 0) {
                            pages.push(<button key={0} className="btn-page" onClick={() => setPageManual(0)}>1</button>);
                            if (startPage > 1) pages.push(<span key="e1">...</span>);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                                <button 
                                    key={i} 
                                    className={`btn-page ${pageManual === i ? 'active' : ''}`} 
                                    onClick={() => setPageManual(i)}
                                    style={pageManual === i ? { backgroundColor: 'var(--primary-red)', color: 'white', borderColor: 'var(--primary-red)' } : {}}
                                >
                                    {i + 1}
                                </button>
                            );
                        }

                        if (endPage < totalPageManual - 1) {
                            if (endPage < totalPageManual - 2) pages.push(<span key="e2">...</span>);
                            pages.push(<button key={totalPageManual - 1} className="btn-page" onClick={() => setPageManual(totalPageManual - 1)}>{totalPageManual}</button>);
                        }

                        return pages.length > 0 ? pages : <button className="btn-page active" style={{ backgroundColor: 'var(--primary-red)', color: 'white' }}>1</button>;
                    })()}
                </div>

                <button 
                    className="btn-page"
                    disabled={pageManual >= totalPageManual - 1 || totalPageManual === 0} 
                    onClick={() => setPageManual(pageManual + 1)}
                >
                    Next &raquo;
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lompat ke:</span>
                    <input 
                        type="number" 
                        min={1} 
                        max={totalPageManual}
                        className="input-field"
                        style={{ width: '60px', padding: '4px 8px', height: 'auto', textAlign: 'center' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                let val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1 && val <= totalPageManual) {
                                    setPageManual(val - 1);
                                }
                                e.target.value = '';
                            }
                        }}
                        placeholder="..."
                    />
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Tambah Data Manual' : 'Edit Data Manual'}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>ID</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    value={formData.id} 
                                    onChange={(e) => setFormData({...formData, id: e.target.value})} 
                                    required 
                                    disabled={modalMode === 'edit'}
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>LOP</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    value={formData.lop} 
                                    onChange={(e) => setFormData({...formData, lop: e.target.value})} 
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Region</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    value={formData.region} 
                                    onChange={(e) => setFormData({...formData, region: e.target.value})} 
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Branch</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    value={formData.branch} 
                                    onChange={(e) => setFormData({...formData, branch: e.target.value})} 
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>ChAM</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    value={formData.cham} 
                                    onChange={(e) => setFormData({...formData, cham: e.target.value})} 
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Batal</button>
                                <button type="submit" className="btn-danger">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualPage;
