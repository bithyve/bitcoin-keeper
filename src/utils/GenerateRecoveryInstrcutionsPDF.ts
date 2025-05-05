import RNHTMLtoPDF from 'react-native-html-to-pdf';

const GenerateRecoveryInstrcutionsPDF = async () => {
  try {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recovery Instructions Document</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap">
    <style>
        body {
        font-family: 'Fira Sans', sans-serif;
            print-color-adjust:exact !important;
            box-sizing: border-box;
            margin: 0px 10px;
        }
        .container {
            max-width: 100%;
            padding: 5px 14px;  
        }
        h1 {
            text-align: center;
            font-weight: 300;
            font-size: 36px;
            margin-top: 20px;
            margin-bottom: 20px;
            color: #2F4F4F;
        }
            h3{
            margin-bottom: 0px;}
        p {
          margin-bottom: 20px;
          line-height: 1.4;
        }
          a{
          text-decoration: underline;
          color: #000;
          }
        .signature {
            margin-top: 30px;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
        }
        .page{  
            background-color: #FFF8ED;
            padding: 10px 20px 10px 20px;
            margin: 5px 0px 50px 0px;
            
        }
            .page-less-margin{
                background-color: #FFF8ED;
            padding: 5px 20px 5px 20px;
            margin: 0px;
            }
            .image {
            display: flex;
            align-items: center;
            justify-content: center;
            max-width: 100%;
            margin-top: 20px;
        }
            .signature{
            display: flex;
            align-items: center;
            justify-content: center;
            align-self: center;
            width: 95%;
            margin-left: 10px;
            margin-top: -10px;
            border-top: 2px solid #000;
            border-color: #000;
            }
            .center{
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            }
            .no-margin-p{
            margin-bottom: 0px;
            }
    </style>
</head>
<body>
<div class="container">
<div class="image"><img  height="200" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEyIiBoZWlnaHQ9Ijg2IiB2aWV3Qm94PSIwIDAgMjEyIDg2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjEyIiBoZWlnaHQ9Ijg2IiByeD0iMTAiIGZpbGw9IiMyRjRGNEYiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02OS41MTEzIDQzQzY5LjUxMTMgNTggNDkuNzU1NyA2OCA0OS43NTU3IDY4QzQ5Ljc1NTcgNjggMzAgNTggMzAgNDNWMjUuNUw0OS43NTU3IDE4TDY5LjUxMTMgMjUuNVY0M1pNNDkuMzU3OCA0MS41MjgxTDQxLjA1MjEgMzUuNTkzQzQwLjk0OTQgMzUuNTE5NiA0MC44ODgzIDM1LjQwMDMgNDAuODg4MyAzNS4yNzNMNDAuODg4MyAzMi4zMjQ5QzQwLjg4ODMgMzIuMDA0NCA0MS4yNDc3IDMxLjgxOTUgNDEuNTAzNCAzMi4wMDg1TDQ5LjU3MiAzNy45NzEzQzQ5LjcwNzcgMzguMDcxNiA0OS44OTE4IDM4LjA3MTggNTAuMDI3NyAzNy45NzE4TDU4LjExNTUgMzIuMDIwN0M1OC4zNzEyIDMxLjgzMjUgNTguNzI5OSAzMi4wMTc1IDU4LjcyOTkgMzIuMzM3NlYzNS4yMDU1QzU4LjcyOTkgMzUuMzMyMiA1OC42Njk0IDM1LjQ1MSA1OC41Njc1IDM1LjUyNDVMNTAuMjQzNCA0MS41MjgxTDUwLjAwNTcgNDEuNjc4NUM0OS44ODAyIDQxLjc1NzkgNDkuNzIxIDQxLjc1NzkgNDkuNTk1NSA0MS42Nzg1TDQ5LjM1NzggNDEuNTI4MVpNNDEuMjc1NSA0OC4zMTM5QzQxLjA2MjEgNDguMzE0MyA0MC44ODkyIDQ4LjQ4OTYgNDAuODg5MiA0OC43MDU3VjUxLjA1NDVDNDAuODg5MiA1MS4yNzA4IDQxLjA2MjUgNTEuNDQ2MiA0MS4yNzYyIDUxLjQ0NjJMNTguMzI1MSA1MS40NDYzQzU4LjUzODggNTEuNDQ2MyA1OC43MTIxIDUxLjI3MDkgNTguNzEyMSA1MS4wNTQ2VjQ4LjY5MTRDNTguNzEyMSA0OC40NzUxIDU4LjUzODggNDguMjk5NyA1OC4zMjUxIDQ4LjI5OTdMNTEuNjMxOSA0OC4yOTk5QzUxLjI1OTQgNDguMjk5OSA1MS4xMDIgNDcuODE5MyA1MS40MDA3IDQ3LjU5NDFMNTguNTcyOSA0Mi4xODQzQzU4LjY3MDkgNDIuMTEwNCA1OC43Mjg3IDQxLjk5MzkgNTguNzI4NyA0MS44NzAyVjM4Ljk5N0M1OC43Mjg3IDM4LjY3NjkgNTguMzcgMzguNDkxOSA1OC4xMTQyIDM4LjY4MDFMNTAuMDI2NSA0NC42MzEyQzQ5Ljg5MDYgNDQuNzMxMiA0OS43MDY1IDQ0LjczMSA0OS41NzA4IDQ0LjYzMDhMNDEuNTAyMiAzOC42Njc5QzQxLjI0NjUgMzguNDc4OSA0MC44ODcxIDM4LjY2MzggNDAuODg3MSAzOC45ODQzVjQxLjkzNzdDNDAuODg3MSA0Mi4wNjIgNDAuOTQ1NCA0Mi4xNzkgNDEuMDQ0MiA0Mi4yNTI4TDQ4LjE5MzMgNDcuNTk1MUM0OC40OTM0IDQ3LjgxOTQgNDguMzM3MiA0OC4zMDEzIDQ3Ljk2NDIgNDguMzAyTDQxLjI3NTUgNDguMzEzOVoiIGZpbGw9IiNGNkYyRUQiLz4KPHBhdGggZD0iTTgzLjk4NDcgMjguNDQzVjIxLjQ4MUg4Ni41MzgxQzg3LjAzMjkgMjEuNDgxIDg3LjQ0MjYgMjEuNTYyNiA4Ny43NjcyIDIxLjcyNThDODguMDkxOCAyMS44ODY3IDg4LjMzNDYgMjIuMTA1NCA4OC40OTU4IDIyLjM4MTlDODguNjU2OSAyMi42NTYxIDg4LjczNzUgMjIuOTY1NCA4OC43Mzc1IDIzLjMwOTlDODguNzM3NSAyMy42IDg4LjY4NDIgMjMuODQ0NyA4OC41Nzc1IDI0LjA0NDJDODguNDcwOCAyNC4yNDEzIDg4LjMyNzggMjQuNCA4OC4xNDg1IDI0LjUyMDFDODcuOTcxNSAyNC42Mzc5IDg3Ljc3NjMgMjQuNzI0MSA4Ny41NjI5IDI0Ljc3ODVWMjQuODQ2NEM4Ny43OTQ0IDI0Ljg1NzggODguMDIwMyAyNC45MzI2IDg4LjI0MDQgMjUuMDcwOEM4OC40NjI5IDI1LjIwNjggODguNjQ2NyAyNS40MDA2IDg4Ljc5MiAyNS42NTIxQzg4LjkzNzIgMjUuOTAzNyA4OS4wMDk5IDI2LjIwOTYgODkuMDA5OSAyNi41N0M4OS4wMDk5IDI2LjkyNTggODguOTI1OSAyNy4yNDUzIDg4Ljc1NzkgMjcuNTI4NkM4OC41OTIyIDI3LjgwOTYgODguMzM1OCAyOC4wMzI4IDg3Ljk4ODUgMjguMTk4M0M4Ny42NDEyIDI4LjM2MTUgODcuMTk3NSAyOC40NDMgODYuNjU3MyAyOC40NDNIODMuOTg0N1pNODUuMDM2NyAyNy41NDIySDg2LjU1NTJDODcuMDU5IDI3LjU0MjIgODcuNDE5OSAyNy40NDQ3IDg3LjYzNzggMjcuMjQ5OEM4Ny44NTU3IDI3LjA1NDkgODcuOTY0NyAyNi44MTEzIDg3Ljk2NDcgMjYuNTE5Qzg3Ljk2NDcgMjYuMjk5MSA4Ny45MDkgMjYuMDk3NCA4Ny43OTc4IDI1LjkxMzlDODcuNjg2NiAyNS43MzAzIDg3LjUyNzcgMjUuNTg0MSA4Ny4zMjEyIDI1LjQ3NTNDODcuMTE2OSAyNS4zNjY2IDg2Ljg3NDEgMjUuMzEyMiA4Ni41OTI2IDI1LjMxMjJIODUuMDM2N1YyNy41NDIyWk04NS4wMzY3IDI0LjQ5MjlIODYuNDQ2MkM4Ni42ODIzIDI0LjQ5MjkgODYuODk0NSAyNC40NDc2IDg3LjA4MjkgMjQuMzU2OUM4Ny4yNzM1IDI0LjI2NjMgODcuNDI0NSAyNC4xMzk0IDg3LjUzNTcgMjMuOTc2MkM4Ny42NDkyIDIzLjgxMDggODcuNzA1OSAyMy42MTU5IDg3LjcwNTkgMjMuMzkxNUM4Ny43MDU5IDIzLjEwMzcgODcuNjA0OSAyMi44NjIzIDg3LjQwMjkgMjIuNjY3NEM4Ny4yMDA5IDIyLjQ3MjUgODYuODkxMSAyMi4zNzUxIDg2LjQ3MzQgMjIuMzc1MUg4NS4wMzY3VjI0LjQ5MjlaIiBmaWxsPSIjRjZGMkVEIi8+CjxwYXRoIGQ9Ik05NS45Nzc2IDIxLjQ4MVYyOC40NDNIOTQuOTI1NlYyMS40ODFIOTUuOTc3NloiIGZpbGw9IiNGNkYyRUQiLz4KPHBhdGggZD0iTTEwMS44OTQgMjIuMzg1M1YyMS40ODFIMTA3LjI5VjIyLjM4NTNIMTA1LjExNVYyOC40NDNIMTA0LjA2NlYyMi4zODUzSDEwMS44OTRaIiBmaWxsPSIjRjZGMkVEIi8+CjxwYXRoIGQ9Ik0xMTkuMDYyIDIzLjc3NzRIMTE4LjAyOEMxMTcuOTg4IDIzLjU1NjggMTE3LjkxNCAyMy4zNjI3IDExNy44MDYgMjMuMTk1QzExNy42OTggMjMuMDI3NCAxMTcuNTY1IDIyLjg4NTEgMTE3LjQwOCAyMi43NjgyQzExNy4yNTIgMjIuNjUxMyAxMTcuMDc2IDIyLjU2MyAxMTYuODgyIDIyLjUwMzVDMTE2LjY4OSAyMi40NDM5IDExNi40ODUgMjIuNDE0MSAxMTYuMjY4IDIyLjQxNDFDMTE1Ljg3NyAyMi40MTQxIDExNS41MjcgMjIuNTEyMyAxMTUuMjE4IDIyLjcwODZDMTE0LjkxMSAyMi45MDUgMTE0LjY2OCAyMy4xOTI4IDExNC40ODkgMjMuNTcyM0MxMTQuMzEyIDIzLjk1MTcgMTE0LjIyNCAyNC40MTQ5IDExNC4yMjQgMjQuOTYyQzExNC4yMjQgMjUuNTEzNSAxMTQuMzEyIDI1Ljk3OSAxMTQuNDg5IDI2LjM1ODRDMTE0LjY2OCAyNi43Mzc4IDExNC45MTIgMjcuMDI0NiAxMTUuMjIxIDI3LjIxODdDMTE1LjUzMSAyNy40MTI5IDExNS44NzggMjcuNTA5OSAxMTYuMjY1IDI3LjUwOTlDMTE2LjQ3OSAyNy41MDk5IDExNi42ODMgMjcuNDgxMiAxMTYuODc1IDI3LjQyMzlDMTE3LjA2OSAyNy4zNjQzIDExNy4yNDUgMjcuMjc3MiAxMTcuNDAyIDI3LjE2MjVDMTE3LjU1OSAyNy4wNDc4IDExNy42OTEgMjYuOTA3NyAxMTcuNzk5IDI2Ljc0MjJDMTE3LjkxIDI2LjU3NDYgMTE3Ljk4NiAyNi4zODI3IDExOC4wMjggMjYuMTY2NUwxMTkuMDYyIDI2LjE2OThDMTE5LjAwNyAyNi41MDI5IDExOC45IDI2LjgwOTUgMTE4Ljc0MSAyNy4wODk3QzExOC41ODQgMjcuMzY3NiAxMTguMzgyIDI3LjYwODEgMTE4LjEzNCAyNy44MTFDMTE3Ljg4OSAyOC4wMTE4IDExNy42MDggMjguMTY3MyAxMTcuMjkyIDI4LjI3NzZDMTE2Ljk3NyAyOC4zODc5IDExNi42MzIgMjguNDQzIDExNi4yNTggMjguNDQzQzExNS42NzEgMjguNDQzIDExNS4xNDcgMjguMzA0MSAxMTQuNjg4IDI4LjAyNjFDMTE0LjIyOCAyNy43NDYgMTEzLjg2NiAyNy4zNDU2IDExMy42MDEgMjYuODI1QzExMy4zMzggMjYuMzA0NCAxMTMuMjA2IDI1LjY4MzQgMTEzLjIwNiAyNC45NjJDMTEzLjIwNiAyNC4yMzg1IDExMy4zMzkgMjMuNjE3NSAxMTMuNjA0IDIzLjA5OTFDMTEzLjg2OSAyMi41Nzg1IDExNC4yMzEgMjIuMTc5MiAxMTQuNjkxIDIxLjkwMTJDMTE1LjE1MSAyMS42MjExIDExNS42NzMgMjEuNDgxIDExNi4yNTggMjEuNDgxQzExNi42MTkgMjEuNDgxIDExNi45NTQgMjEuNTMyOSAxMTcuMjY2IDIxLjYzNjVDMTE3LjU4IDIxLjczOCAxMTcuODYxIDIxLjg4OCAxMTguMTExIDIyLjA4NjVDMTE4LjM2MSAyMi4yODI5IDExOC41NjcgMjIuNTIzMyAxMTguNzMxIDIyLjgwNzlDMTE4Ljg5NCAyMy4wOTAzIDExOS4wMDUgMjMuNDEzNCAxMTkuMDYyIDIzLjc3NzRaIiBmaWxsPSIjRjZGMkVEIi8+CjxwYXRoIGQ9Ik0xMzEuMDkzIDI0Ljk2MkMxMzEuMDkzIDI1LjY4NTYgMTMwLjk2IDI2LjMwNzcgMTMwLjY5NSAyNi44MjgzQzEzMC40MyAyNy4zNDY3IDEzMC4wNjYgMjcuNzQ2IDEyOS42MDUgMjguMDI2MUMxMjkuMTQ1IDI4LjMwNDEgMTI4LjYyMyAyOC40NDMgMTI4LjAzNyAyOC40NDNDMTI3LjQ0OSAyOC40NDMgMTI2LjkyNSAyOC4zMDQxIDEyNi40NjMgMjguMDI2MUMxMjYuMDAzIDI3Ljc0NiAxMjUuNjQxIDI3LjM0NTYgMTI1LjM3NiAyNi44MjVDMTI1LjExMSAyNi4zMDQ0IDEyNC45NzggMjUuNjgzNCAxMjQuOTc4IDI0Ljk2MkMxMjQuOTc4IDI0LjIzODUgMTI1LjExMSAyMy42MTc1IDEyNS4zNzYgMjMuMDk5MUMxMjUuNjQxIDIyLjU3ODUgMTI2LjAwMyAyMi4xNzkyIDEyNi40NjMgMjEuOTAxMkMxMjYuOTI1IDIxLjYyMTEgMTI3LjQ0OSAyMS40ODEgMTI4LjAzNyAyMS40ODFDMTI4LjYyMyAyMS40ODEgMTI5LjE0NSAyMS42MjExIDEyOS42MDUgMjEuOTAxMkMxMzAuMDY2IDIyLjE3OTIgMTMwLjQzIDIyLjU3ODUgMTMwLjY5NSAyMy4wOTkxQzEzMC45NiAyMy42MTc1IDEzMS4wOTMgMjQuMjM4NSAxMzEuMDkzIDI0Ljk2MlpNMTMwLjA3OSAyNC45NjJDMTMwLjA3OSAyNC40MTA1IDEyOS45ODkgMjMuOTQ2MiAxMjkuODEgMjMuNTY5QzEyOS42MzMgMjMuMTg5NSAxMjkuMzkgMjIuOTAyOCAxMjkuMDgxIDIyLjcwODZDMTI4Ljc3NCAyMi41MTIzIDEyOC40MjYgMjIuNDE0MSAxMjguMDM3IDIyLjQxNDFDMTI3LjY0NiAyMi40MTQxIDEyNy4yOTcgMjIuNTEyMyAxMjYuOTkgMjIuNzA4NkMxMjYuNjgzIDIyLjkwMjggMTI2LjQ0IDIzLjE4OTUgMTI2LjI2MSAyMy41NjlDMTI2LjA4NCAyMy45NDYyIDEyNS45OTYgMjQuNDEwNSAxMjUuOTk2IDI0Ljk2MkMxMjUuOTk2IDI1LjUxMzUgMTI2LjA4NCAyNS45NzkgMTI2LjI2MSAyNi4zNTg0QzEyNi40NCAyNi43MzU2IDEyNi42ODMgMjcuMDIyNCAxMjYuOTkgMjcuMjE4N0MxMjcuMjk3IDI3LjQxMjkgMTI3LjY0NiAyNy41MDk5IDEyOC4wMzcgMjcuNTA5OUMxMjguNDI2IDI3LjUwOTkgMTI4Ljc3NCAyNy40MTI5IDEyOS4wODEgMjcuMjE4N0MxMjkuMzkgMjcuMDIyNCAxMjkuNjMzIDI2LjczNTYgMTI5LjgxIDI2LjM1ODRDMTI5Ljk4OSAyNS45NzkgMTMwLjA3OSAyNS41MTM1IDEzMC4wNzkgMjQuOTYyWiIgZmlsbD0iI0Y2RjJFRCIvPgo8cGF0aCBkPSJNMTM4LjA2MSAyMS40ODFWMjguNDQzSDEzNy4wMDlWMjEuNDgxSDEzOC4wNjFaIiBmaWxsPSIjRjZGMkVEIi8+CjxwYXRoIGQ9Ik0xNDkuNjA1IDIxLjQ4MVYyOC40NDNIMTQ4LjYzOEwxNDUuMDk0IDIzLjMzNzFIMTQ1LjAyOVYyOC40NDNIMTQzLjk3N1YyMS40ODFIMTQ0Ljk1MUwxNDguNDk4IDI2LjU5MzdIMTQ4LjU2M1YyMS40ODFIMTQ5LjYwNVoiIGZpbGw9IiNGNkYyRUQiLz4KPHBhdGggZD0iTTE2OS43NDggNTUuODQ3OEMxNzAuMzYyIDU1Ljg0NzggMTcwLjc5MiA1NS43MDQ3IDE3MS4wMzcgNTUuNDE4NUMxNzEuMjgzIDU1LjEzMjMgMTcxLjQyNiA1NC43MzM3IDE3MS40NjcgNTQuMjIyN0MxNzEuNTI5IDUzLjcxMTcgMTcxLjU1OSA1My4xMTg5IDE3MS41NTkgNTIuNDQ0NFY0Ni4wNjY5QzE3MS41NTkgNDUuNzM5OCAxNzEuNTU5IDQ1LjM5MjMgMTcxLjU1OSA0NS4wMjQ0QzE3MS41OCA0NC42MzYgMTcxLjYyMSA0NC4yNTc5IDE3MS42ODIgNDMuODg5OUMxNzEuMzM0IDQzLjkxMDQgMTcwLjk2NiA0My45MzA4IDE3MC41NzcgNDMuOTUxM0MxNzAuMTg4IDQzLjk1MTMgMTY5LjgzIDQzLjk2MTUgMTY5LjUwMiA0My45ODE5VjQyLjM1NjlIMTcwLjU0NkMxNzEuNDA2IDQyLjM1NjkgMTcyLjA2MSA0Mi4yNjQ5IDE3Mi41MTEgNDIuMDgwOUMxNzIuOTYyIDQxLjg5NyAxNzMuMjg5IDQxLjcwMjggMTczLjQ5NCA0MS40OTg0SDE3NC41OTlDMTc0LjY0IDQxLjc4NDUgMTc0LjY3MSA0Mi4xODMxIDE3NC42OTIgNDIuNjk0MUMxNzQuNzEyIDQzLjIwNTIgMTc0LjczMyA0My43Nzc1IDE3NC43NTMgNDQuNDExMkMxNzUuMTQyIDQzLjgzODggMTc1LjU5MiA0My4zMjc4IDE3Ni4xMDQgNDIuODc4MUMxNzYuNjE2IDQyLjQwOCAxNzcuMTY5IDQyLjAyOTggMTc3Ljc2MiA0MS43NDM3QzE3OC4zNzcgNDEuNDU3NSAxNzkuMDExIDQxLjMxNDQgMTc5LjY2NiA0MS4zMTQ0QzE4MC4zMDEgNDEuMzE0NCAxODAuODQzIDQxLjQ4ODEgMTgxLjI5NCA0MS44MzU2QzE4MS43NjUgNDIuMTYyNyAxODIgNDIuNzA0NCAxODIgNDMuNDYwN0MxODIgNDMuNjY1MSAxODEuOTM5IDQzLjkwMDIgMTgxLjgxNiA0NC4xNjU5QzE4MS43MTMgNDQuNDMxNiAxODEuNTI5IDQ0LjY2NjcgMTgxLjI2MyA0NC44NzExQzE4MS4wMTcgNDUuMDU1MSAxODAuNjggNDUuMTQ3IDE4MC4yNSA0NS4xNDdDMTc5LjgyIDQ1LjEyNjYgMTc5LjQ0MSA0NC45NjMxIDE3OS4xMTMgNDQuNjU2NUMxNzguODA2IDQ0LjM0OTggMTc4LjY2MyA0My45MzA4IDE3OC42ODQgNDMuMzk5NEMxNzguMTkyIDQzLjM5OTQgMTc3LjcwMSA0My41NTI3IDE3Ny4yMSA0My44NTkzQzE3Ni43MTggNDQuMTQ1NCAxNzYuMjU4IDQ0LjUzMzggMTc1LjgyOCA0NS4wMjQ0QzE3NS40MTggNDUuNTE1IDE3NS4wNyA0Ni4wNDY0IDE3NC43ODQgNDYuNjE4OFY1My4zMzM2QzE3NC43ODQgNTMuNzAxNSAxNzQuNzczIDU0LjA3OTYgMTc0Ljc1MyA1NC40NjhDMTc0Ljc1MyA1NC44MzU5IDE3NC43MjIgNTUuMjE0MSAxNzQuNjYxIDU1LjYwMjVDMTc0Ljk4OCA1NS41ODIgMTc1LjMyNiA1NS41NzE4IDE3NS42NzQgNTUuNTcxOEMxNzYuMDIyIDU1LjU1MTQgMTc2LjM0IDU1LjUzMDkgMTc2LjYyNiA1NS41MTA1VjU3LjEzNTVIMTY5Ljc0OFY1NS44NDc4WiIgZmlsbD0iI0Y2RjJFRCIvPgo8cGF0aCBkPSJNMTYxLjA5MyA1Ny4xODAzQzE1OS42OTkgNTcuMTgwMyAxNTguNDQ0IDU2Ljg2MjIgMTU3LjMyOSA1Ni4yMjZDMTU2LjIzNCA1NS41Njk5IDE1NS4zNjggNTQuNjU1MyAxNTQuNzMxIDUzLjQ4MjNDMTU0LjA5NCA1Mi4yODkzIDE1My43NzUgNTAuODg3NiAxNTMuNzc1IDQ5LjI3NzJDMTUzLjc3NSA0Ny44ODU0IDE1NC4wODQgNDYuNTgzMiAxNTQuNzAxIDQ1LjM3MDRDMTU1LjMzOCA0NC4xNTc1IDE1Ni4yMjQgNDMuMTgzMyAxNTcuMzU5IDQyLjQ0NzdDMTU4LjQ5NCA0MS42OTIyIDE1OS44MDggNDEuMzE0NCAxNjEuMzAyIDQxLjMxNDRDMTYyLjEzOCA0MS4zMTQ0IDE2Mi45MjUgNDEuNDQzNiAxNjMuNjYxIDQxLjcwMjFDMTY0LjQxOCA0MS45NjA2IDE2NS4wODUgNDIuMzY4MiAxNjUuNjYzIDQyLjkyNDlDMTY2LjI2IDQzLjQ2MTcgMTY2LjcyOCA0NC4xNjc1IDE2Ny4wNjYgNDUuMDQyM0MxNjcuNDA1IDQ1Ljg5NzIgMTY3LjU3NCA0Ni45NDEgMTY3LjU3NCA0OC4xNzM3TDE1Ny4yOTkgNDguMzUyN0MxNTcuMjk5IDQ5LjcwNDcgMTU3LjQ0OSA1MC45MDc1IDE1Ny43NDcgNTEuOTYxM0MxNTguMDY2IDUzLjAxNSAxNTguNTc0IDUzLjgzMDIgMTU5LjI3MSA1NC40MDY4QzE1OS45NjggNTQuOTgzNCAxNjAuODc0IDU1LjI3MTcgMTYxLjk4OSA1NS4yNzE3QzE2Mi41MjYgNTUuMjcxNyAxNjMuMDk0IDU1LjE4MjIgMTYzLjY5MSA1NS4wMDMyQzE2NC4zMDggNTQuODA0NCAxNjQuODg2IDU0LjUyNjEgMTY1LjQyNCA1NC4xNjgyQzE2NS45ODEgNTMuODEwMyAxNjYuNDQ5IDUzLjM4MjkgMTY2LjgyNyA1Mi44ODU4TDE2Ny43NTMgNTMuNjkxQzE2Ny4xNTYgNTQuNTg1NyAxNjYuNDY5IDU1LjI5MTUgMTY1LjY5MiA1NS44MDg1QzE2NC45MTYgNTYuMzA1NSAxNjQuMTE5IDU2LjY1MzUgMTYzLjMwMyA1Ni44NTIzQzE2Mi41MDYgNTcuMDcxIDE2MS43NyA1Ny4xODAzIDE2MS4wOTMgNTcuMTgwM1pNMTU3LjQxOSA0Ni44MDE5SDE2NC4zMThDMTY0LjMxOCA0Ni4wNDYzIDE2NC4yMDkgNDUuMzcwNCAxNjMuOTkgNDQuNzczOUMxNjMuNzkxIDQ0LjE1NzUgMTYzLjQ3MiA0My42NzA0IDE2My4wMzQgNDMuMzEyNkMxNjIuNTk2IDQyLjk1NDcgMTYyLjAzOSA0Mi43NzU3IDE2MS4zNjEgNDIuNzc1N0MxNjAuMzA2IDQyLjc3NTcgMTU5LjQ0IDQzLjExMzcgMTU4Ljc2MyA0My43ODk3QzE1OC4wODYgNDQuNDQ1OCAxNTcuNjM4IDQ1LjQ0OTkgMTU3LjQxOSA0Ni44MDE5WiIgZmlsbD0iI0Y2RjJFRCIvPgo8cGF0aCBkPSJNMTM1LjgwNCA2NC4zMDgxVjYzLjA1NTVDMTM2LjQwMSA2My4wNTU1IDEzNi44MTkgNjIuOTE2MyAxMzcuMDU4IDYyLjYzOEMxMzcuMjk3IDYyLjM1OTYgMTM3LjQzNyA2MS45NzE5IDEzNy40NzcgNjEuNDc0OUMxMzcuNTM2IDYwLjk3NzggMTM3LjU2NiA2MC40MDEzIDEzNy41NjYgNTkuNzQ1MUwxMzcuNTk2IDQ1LjkzN0MxMzcuNTk2IDQ1LjYxODkgMTM3LjYwNiA0NS4yODA5IDEzNy42MjYgNDQuOTIzQzEzNy42NDYgNDQuNTQ1MiAxMzcuNjc2IDQ0LjE3NzQgMTM3LjcxNiA0My44MTk1QzEzNy4zNzcgNDMuODM5NCAxMzcuMDE5IDQzLjg1OTMgMTM2LjY0IDQzLjg3OTJDMTM2LjI2MiA0My44NzkyIDEzNS45MTMgNDMuODg5MSAxMzUuNTk1IDQzLjkwOVY0Mi4zMjg0QzEzNi40OTEgNDIuMzI4NCAxMzcuMTg4IDQyLjI4ODYgMTM3LjY4NiA0Mi4yMDkxQzEzOC4yMDMgNDIuMTA5NyAxMzguNTkyIDQyLjAwMDMgMTM4Ljg1MSA0MS44ODFDMTM5LjEyOSA0MS43NjE3IDEzOS4zMzggNDEuNjMyNSAxMzkuNDc4IDQxLjQ5MzNIMTQwLjU1M0MxNDAuNTczIDQxLjY5MjIgMTQwLjU5MyA0MS45MzA3IDE0MC42MTMgNDIuMjA5MUMxNDAuNjMzIDQyLjQ4NzQgMTQwLjY1MyA0Mi43NjU4IDE0MC42NzIgNDMuMDQ0MUMxNDEuMzEgNDIuNDg3NCAxNDIuMDE3IDQyLjA2IDE0Mi43OTMgNDEuNzYxN0MxNDMuNTcgNDEuNDYzNSAxNDQuMzQ2IDQxLjMxNDQgMTQ1LjEyMyA0MS4zMTQ0QzE0Ni4yNzggNDEuMzE0NCAxNDcuMzMzIDQxLjYyMjYgMTQ4LjI4OSA0Mi4yMzg5QzE0OS4yNjUgNDIuODM1NCAxNTAuMDQxIDQzLjY5MDMgMTUwLjYxOSA0NC44MDM3QzE1MS4yMTYgNDUuOTE3MSAxNTEuNTE1IDQ3LjIzOTMgMTUxLjUxNSA0OC43NzAyQzE1MS41MTUgNTAuNDIwNCAxNTEuMTc2IDUxLjg4MTggMTUwLjQ5OSA1My4xNTQyQzE0OS44MjIgNTQuNDI2NyAxNDguOTA2IDU1LjQyMDggMTQ3Ljc1MSA1Ni4xMzY1QzE0Ni42MTYgNTYuODMyNCAxNDUuMzUyIDU3LjE4MDMgMTQzLjk1OCA1Ny4xODAzQzE0My4zMjEgNTcuMTgwMyAxNDIuNzMzIDU3LjEwMDggMTQyLjE5NiA1Ni45NDE4QzE0MS42NTggNTYuODAyNiAxNDEuMTUgNTYuNjAzOCAxNDAuNjcyIDU2LjM0NTNWNjAuNjFDMTQwLjY3MiA2MC45Njc5IDE0MC42NjMgNjEuMzI1OCAxNDAuNjQzIDYxLjY4MzZDMTQwLjY0MyA2Mi4wNjE0IDE0MC42MjMgNjIuNDM5MiAxNDAuNTgzIDYyLjgxNjlDMTQwLjkwMSA2Mi43OTcgMTQxLjIyIDYyLjc3NzIgMTQxLjUzOSA2Mi43NTczQzE0MS44NzcgNjIuNzU3MyAxNDIuMTg2IDYyLjc0NzMgMTQyLjQ2NSA2Mi43Mjc1VjY0LjMwODFIMTM1LjgwNFpNMTQzLjc0OSA1NS42Mjk1QzE0NC43MDUgNTUuNjI5NSAxNDUuNDkxIDU1LjM1MTIgMTQ2LjEwOSA1NC43OTQ1QzE0Ni43NDYgNTQuMjE3OSAxNDcuMjE0IDUzLjQ1MjQgMTQ3LjUxMiA1Mi40OTgxQzE0Ny44MzEgNTEuNTIzOSAxNDcuOTkgNTAuNDMwNCAxNDcuOTkgNDkuMjE3NkMxNDcuOTkgNDguMjAzNiAxNDcuODUxIDQ3LjIzOTMgMTQ3LjU3MiA0Ni4zMjQ3QzE0Ny4yOTMgNDUuMzkwMiAxNDYuODQ1IDQ0LjYzNDcgMTQ2LjIyOCA0NC4wNTgxQzE0NS42MzEgNDMuNDYxNyAxNDQuODQ0IDQzLjE3MzQgMTQzLjg2OCA0My4xOTMzQzE0My4yNTEgNDMuMTkzMyAxNDIuNjY0IDQzLjM0MjQgMTQyLjEwNiA0My42NDA2QzE0MS41NDkgNDMuOTM4OCAxNDEuMDgxIDQ0LjMwNjcgMTQwLjcwMiA0NC43NDQxQzE0MC43MDIgNDUuMDAyNSAxNDAuNzAyIDQ1LjI4MDkgMTQwLjcwMiA0NS41NzkxQzE0MC43MjIgNDUuODc3NCAxNDAuNzMyIDQ2LjI1NTEgMTQwLjczMiA0Ni43MTI0QzE0MC43MzIgNDcuMTQ5OCAxNDAuNzMyIDQ3LjcxNjQgMTQwLjczMiA0OC40MTIzQzE0MC43MzIgNDkuMDg4MyAxNDAuNzIyIDQ5Ljk0MzIgMTQwLjcwMiA1MC45NzcxQzE0MC43MDIgNTEuOTkxMSAxNDAuNzAyIDUzLjIyMzggMTQwLjcwMiA1NC42NzUyQzE0MS4xMDEgNTQuOTczNCAxNDEuNTU5IDU1LjIxMiAxNDIuMDc2IDU1LjM5MUMxNDIuNjE0IDU1LjU2OTkgMTQzLjE3MSA1NS42NDk0IDE0My43NDkgNTUuNjI5NVoiIGZpbGw9IiNGNkYyRUQiLz4KPHBhdGggZD0iTTEyNy4wODIgNTcuMTgwM0MxMjUuNjg4IDU3LjE4MDMgMTI0LjQzMyA1Ni44NjIyIDEyMy4zMTggNTYuMjI2QzEyMi4yMjMgNTUuNTY5OSAxMjEuMzU3IDU0LjY1NTMgMTIwLjcyIDUzLjQ4MjNDMTIwLjA4MiA1Mi4yODkzIDExOS43NjQgNTAuODg3NiAxMTkuNzY0IDQ5LjI3NzJDMTE5Ljc2NCA0Ny44ODU0IDEyMC4wNzIgNDYuNTgzMiAxMjAuNjkgNDUuMzcwNEMxMjEuMzI3IDQ0LjE1NzUgMTIyLjIxMyA0My4xODMzIDEyMy4zNDggNDIuNDQ3N0MxMjQuNDgzIDQxLjY5MjIgMTI1Ljc5NyA0MS4zMTQ0IDEyNy4yOTEgNDEuMzE0NEMxMjguMTI3IDQxLjMxNDQgMTI4LjkxMyA0MS40NDM2IDEyOS42NSA0MS43MDIxQzEzMC40MDcgNDEuOTYwNiAxMzEuMDc0IDQyLjM2ODIgMTMxLjY1MSA0Mi45MjQ5QzEzMi4yNDkgNDMuNDYxNyAxMzIuNzE3IDQ0LjE2NzUgMTMzLjA1NSA0NS4wNDIzQzEzMy4zOTQgNDUuODk3MiAxMzMuNTYzIDQ2Ljk0MSAxMzMuNTYzIDQ4LjE3MzdMMTIzLjI4OCA0OC4zNTI3QzEyMy4yODggNDkuNzA0NyAxMjMuNDM4IDUwLjkwNzUgMTIzLjczNiA1MS45NjEzQzEyNC4wNTUgNTMuMDE1IDEyNC41NjMgNTMuODMwMiAxMjUuMjYgNTQuNDA2OEMxMjUuOTU2IDU0Ljk4MzQgMTI2Ljg2MiA1NS4yNzE3IDEyNy45NzggNTUuMjcxN0MxMjguNTE1IDU1LjI3MTcgMTI5LjA4MyA1NS4xODIyIDEyOS42OCA1NS4wMDMyQzEzMC4yOTcgNTQuODA0NCAxMzAuODc1IDU0LjUyNjEgMTMxLjQxMiA1NC4xNjgyQzEzMS45NyA1My44MTAzIDEzMi40MzggNTMuMzgyOSAxMzIuODE2IDUyLjg4NThMMTMzLjc0MiA1My42OTFDMTMzLjE0NSA1NC41ODU3IDEzMi40NTggNTUuMjkxNSAxMzEuNjgxIDU1LjgwODVDMTMwLjkwNSA1Ni4zMDU1IDEzMC4xMDggNTYuNjUzNSAxMjkuMjkyIDU2Ljg1MjNDMTI4LjQ5NSA1Ny4wNzEgMTI3Ljc1OSA1Ny4xODAzIDEyNy4wODIgNTcuMTgwM1pNMTIzLjQwOCA0Ni44MDE5SDEzMC4zMDdDMTMwLjMwNyA0Ni4wNDYzIDEzMC4xOTggNDUuMzcwNCAxMjkuOTc5IDQ0Ljc3MzlDMTI5Ljc4IDQ0LjE1NzUgMTI5LjQ2MSA0My42NzA0IDEyOS4wMjMgNDMuMzEyNkMxMjguNTg1IDQyLjk1NDcgMTI4LjAyNyA0Mi43NzU3IDEyNy4zNSA0Mi43NzU3QzEyNi4yOTUgNDIuNzc1NyAxMjUuNDI5IDQzLjExMzcgMTI0Ljc1MiA0My43ODk3QzEyNC4wNzUgNDQuNDQ1OCAxMjMuNjI3IDQ1LjQ0OTkgMTIzLjQwOCA0Ni44MDE5WiIgZmlsbD0iI0Y2RjJFRCIvPgo8cGF0aCBkPSJNMTExLjAxIDU3LjE4MDNDMTA5LjYxNiA1Ny4xODAzIDEwOC4zNjIgNTYuODYyMiAxMDcuMjQ3IDU2LjIyNkMxMDYuMTUyIDU1LjU2OTkgMTA1LjI4NSA1NC42NTUzIDEwNC42NDggNTMuNDgyM0MxMDQuMDExIDUyLjI4OTMgMTAzLjY5MiA1MC44ODc2IDEwMy42OTIgNDkuMjc3MkMxMDMuNjkyIDQ3Ljg4NTQgMTA0LjAwMSA0Ni41ODMyIDEwNC42MTggNDUuMzcwNEMxMDUuMjU2IDQ0LjE1NzUgMTA2LjE0MiA0My4xODMzIDEwNy4yNzcgNDIuNDQ3N0MxMDguNDEyIDQxLjY5MjIgMTA5LjcyNiA0MS4zMTQ0IDExMS4yMTkgNDEuMzE0NEMxMTIuMDU2IDQxLjMxNDQgMTEyLjg0MiA0MS40NDM2IDExMy41NzkgNDEuNzAyMUMxMTQuMzM2IDQxLjk2MDYgMTE1LjAwMyA0Mi4zNjgyIDExNS41OCA0Mi45MjQ5QzExNi4xNzcgNDMuNDYxNyAxMTYuNjQ1IDQ0LjE2NzUgMTE2Ljk4NCA0NS4wNDIzQzExNy4zMjIgNDUuODk3MiAxMTcuNDkyIDQ2Ljk0MSAxMTcuNDkyIDQ4LjE3MzdMMTA3LjIxNyA0OC4zNTI3QzEwNy4yMTcgNDkuNzA0NyAxMDcuMzY2IDUwLjkwNzUgMTA3LjY2NSA1MS45NjEzQzEwNy45ODQgNTMuMDE1IDEwOC40OTEgNTMuODMwMiAxMDkuMTg4IDU0LjQwNjhDMTA5Ljg4NSA1NC45ODM0IDExMC43OTEgNTUuMjcxNyAxMTEuOTA2IDU1LjI3MTdDMTEyLjQ0NCA1NS4yNzE3IDExMy4wMTEgNTUuMTgyMiAxMTMuNjA5IDU1LjAwMzJDMTE0LjIyNiA1NC44MDQ0IDExNC44MDQgNTQuNTI2MSAxMTUuMzQxIDU0LjE2ODJDMTE1Ljg5OSA1My44MTAzIDExNi4zNjcgNTMuMzgyOSAxMTYuNzQ1IDUyLjg4NThMMTE3LjY3MSA1My42OTFDMTE3LjA3NCA1NC41ODU3IDExNi4zODcgNTUuMjkxNSAxMTUuNjEgNTUuODA4NUMxMTQuODMzIDU2LjMwNTUgMTE0LjAzNyA1Ni42NTM1IDExMy4yMjEgNTYuODUyM0MxMTIuNDI0IDU3LjA3MSAxMTEuNjg3IDU3LjE4MDMgMTExLjAxIDU3LjE4MDNaTTEwNy4zMzYgNDYuODAxOUgxMTQuMjM2QzExNC4yMzYgNDYuMDQ2MyAxMTQuMTI3IDQ1LjM3MDQgMTEzLjkwNyA0NC43NzM5QzExMy43MDggNDQuMTU3NSAxMTMuMzkgNDMuNjcwNCAxMTIuOTUyIDQzLjMxMjZDMTEyLjUxNCA0Mi45NTQ3IDExMS45NTYgNDIuNzc1NyAxMTEuMjc5IDQyLjc3NTdDMTEwLjIyNCA0Mi43NzU3IDEwOS4zNTggNDMuMTEzNyAxMDguNjgxIDQzLjc4OTdDMTA4LjAwMyA0NC40NDU4IDEwNy41NTUgNDUuNDQ5OSAxMDcuMzM2IDQ2LjgwMTlaIiBmaWxsPSIjRjZGMkVEIi8+CjxwYXRoIGQ9Ik04My45ODQ3IDU3LjE2NzNWNTUuODI1OUM4NC42NTY0IDU1Ljc4NTMgODUuMTM0OCA1NS42NDMgODUuNDE5NyA1NS4zOTkxQzg1LjcyNSA1NS4xNTUyIDg1LjkxODQgNTQuNzg5NCA4NS45OTk4IDU0LjMwMTZDODYuMDgxMyA1My44MTM5IDg2LjEyMiA1My4xOTQgODYuMTIyIDUyLjQ0MlYzOS43NTk3Qzg2LjEyMiAzOS4zMTI2IDg2LjEzMjEgMzguODg1OCA4Ni4xNTI1IDM4LjQ3OTNDODYuMTcyOSAzOC4wNTI1IDg2LjE5MzIgMzcuNjg2NyA4Ni4yMTM2IDM3LjM4MThDODUuODY3NSAzNy40MDIxIDg1LjQ5MSAzNy40MjI0IDg1LjA4MzkgMzcuNDQyOEM4NC42NzY4IDM3LjQ2MzEgODQuMzEwNCAzNy40ODM0IDgzLjk4NDcgMzcuNTAzN1YzNS44MjdIOTEuNDk1N1YzNy4xNjg0QzkwLjg0NDMgMzcuMTg4NyA5MC4zNjYgMzcuMzMxIDkwLjA2MDcgMzcuNTk1MkM4OS43NTUzIDM3LjgzOTEgODkuNTYyIDM4LjIwNDkgODkuNDgwNSAzOC42OTI3Qzg5LjM5OTEgMzkuMTYwMiA4OS4zNTg0IDM5Ljc4IDg5LjM1ODQgNDAuNTUyNFY0NS40MzAySDkxLjYxNzhMOTQuOTQ1OCA0MC4wOTUxQzk1LjI1MTIgMzkuNjI3NiA5NS41OTcyIDM5LjEyOTcgOTUuOTgzOSAzOC42MDEyQzk2LjM3MDcgMzguMDcyOCA5Ni43MzcxIDM3LjY1NjIgOTcuMDgzMSAzNy4zNTEzQzk2Ljc3NzggMzcuMzcxNiA5Ni40NTIxIDM3LjM5MiA5Ni4xMDYxIDM3LjQxMjNDOTUuNzgwNCAzNy40MTIzIDk1LjQ4NTIgMzcuNDIyNCA5NS4yMjA2IDM3LjQ0MjhWMzUuODI3SDEwMi4wOVYzNy4xNjg0QzEwMS4zNTggMzcuMjA5IDEwMC42NzYgMzcuMzMxIDEwMC4wNDUgMzcuNTM0MkM5OS40MzQxIDM3LjczNzUgOTguODMzNiAzOC4wOTMxIDk4LjI0MzMgMzguNjAxMkM5Ny42NTMgMzkuMTA5MyA5Ny4wMzIyIDM5Ljg5MTggOTYuMzgwOSA0MC45NDg3TDkzLjQxOTIgNDUuNjc0QzkzLjk0ODQgNDUuOTk5MiA5NC4zODYxIDQ2LjM2NTEgOTQuNzMyMSA0Ni43NzE1Qzk1LjA3ODEgNDcuMTc4IDk1LjQxNCA0Ny41OTQ3IDk1LjczOTcgNDguMDIxNUw5OS4wNjc3IDUyLjUwMjlDOTkuNzE5MSA1My4zNzY5IDEwMC4yNzkgNTQuMDU3NyAxMDAuNzQ3IDU0LjU0NTVDMTAxLjIzNiA1NS4wMzMzIDEwMS42OTQgNTUuMzY4NiAxMDIuMTIxIDU1LjU1MTZDMTAyLjU0OCA1NS43MzQ1IDEwMi45NzYgNTUuODI1OSAxMDMuNDAzIDU1LjgyNTlWNTcuMTY3M0g5OS4zNDI1Qzk5LjE1OTMgNTcuMTY3MyA5OC44OTQ3IDU3LjAxNDkgOTguNTQ4NyA1Ni43MUM5OC4yMDI2IDU2LjQwNTIgOTcuODI2MSA1Ni4wMTkgOTcuNDE5IDU1LjU1MTZDOTcuMDMyMiA1NS4wODQxIDk2LjY1NTcgNTQuNjE2NyA5Ni4yODkzIDU0LjE0OTJMOTIuODM5MSA0OS4zOTM0QzkyLjQ5MzEgNDguOTI1OSA5Mi4xMzY5IDQ4LjQ2ODYgOTEuNzcwNSA0OC4wMjE1QzkxLjQyNDQgNDcuNTc0MyA5MS4wNzg0IDQ3LjI0OTIgOTAuNzMyNCA0Ny4wNDU5SDg5LjM1ODRWNTMuMDgyMkM4OS4zNTg0IDUzLjYzMDkgODkuMzQ4MiA1NC4xMjg5IDg5LjMyNzkgNTQuNTc2Qzg5LjMyNzkgNTUuMDAyOCA4OS4zMDc1IDU1LjM0ODMgODkuMjY2OCA1NS42MTI1Qzg5LjYxMjggNTUuNTcxOSA4OS45ODk0IDU1LjU1MTYgOTAuMzk2NSA1NS41NTE2QzkwLjgyNCA1NS41MzEyIDkxLjE5MDQgNTUuNTEwOSA5MS40OTU3IDU1LjQ5MDZWNTcuMTY3M0g4My45ODQ3WiIgZmlsbD0iI0Y2RjJFRCIvPgo8L3N2Zz4K
"/></div>
        <h1>Recovery Instructions Document</h1>
    <div class="page">
        <p>Dear Beneficiary,</p>
        <p>You are about to receive the most unique inheritance mankind has ever seen. Your benefactor has willed their bitcoin to you. They carefully stacked bitcoin, made sure to keep up with technology to keep it safe for you, and set up a robust inheritance plan to ensure you received the bitcoin after they moved on. Clearly, you meant the world to them. Do take your time with this document as you work to take custody of your benefactor’s bitcoin. Please accept our thoughts and prayers for your family and the dearly departed.</p>
        <p>Kind Regards,<br>
        Team Keeper</p>
        <p class="signature"></p>
        <p>This document is part of a comprehensive plan to pass on your benefactor’s bitcoin controlled by specific cryptographic keys. Herein, you will find information and instructions for recovering the intended funds once you can access some or all the keys.</p>
        <p>Legal Disclaimer: This document is for informational purposes only and does not constitute legal advice. It should be used alongside legal and financial advice from qualified professionals. The creators of this document are not liable for any losses or damages arising from its use.</p>
        <p>Note on Ownership: This document helps access digital assets but does not establish legal ownership. Legal ownership must be established through legal documentation like a will. Consult legal professionals for compliance with inheritance laws.</p>
        </div>  
        <br>
         <div class="page">
        <h3>Bitcoin Wallets and Keys</h3>
        <p>Bitcoin is held in wallets with m-of-n configurations where m and n represent the number of keys. Any m out of n keys are needed to control the access to the funds, i.e. for signing transactions from the wallet. For example, a 1-of-1 wallet (typically called a singlesig wallet) has one key needed to sign transactions from that wallet. Meanwhile, a 3-of-5 wallet (typically called a multisig or multi-key wallet) will need any 3 of the five keys to sign a transaction. The setup of the wallets is generally stored in a Wallet Configuration file, also referred to as output descriptors or BSMS files.</p>
        <p>The keys which control your benefactor’s funds in the intended wallets would be secured by them in hardware devices, software apps, or written down as BIP 39 seed words. Access to some of these keys will be needed along with the Wallet Configuration details to gain complete access.</p>
        <p>Details of these keys may be included by your benefactor along with this document or provided separately.</p>
        <h3>Support and Assistance</h3>
        <p>Suppose the beneficiary is not experienced with handling bitcoin keys. In that case, they may want to consult specific individuals to help them recover funds in the bitcoin wallets. Seek opinions from multiple experts, preferably those who do not collaborate, to ensure unbiased assistance. The benefactor may provide a list of Trusted Individuals who are competent to help in this regard.</p>
        <p>Even when consulting with experts, never share the cryptographic keys with them. These keys can be in the form of hardware devices, software/apps, or written recovery phrase words. They can also be digital information in the form of long cryptographic material.</p>
        <p>It may be a good idea to understand some of them using the References section, which includes guides and recommended software for bitcoin wallet management.</p>
       </div>
       <br><br><br><br><br><br><br>
        <div class="page-less-margin">
        <h3>Wallet Recreation/Recovery Process</h3>
        <p>The process may vary depending on the software being used. Below is a brief on how this can be achieved in three different ways:</p>
        <h3>Using the Bitcoin Keeper App:</h3>
        <p>This is the easiest and the least error-prone method. You will only need the App Recovery Phrase (twelve-word app seed) for this method.<br>
            1. Download the Bitcoin Keeper app from a trusted source like App Stores or through their hosted APKs.<br>
            2. Once installed, do not create a new app. Please follow the in-app instructions on how to recover an existing app.<br>
            3. You will be prompted to enter the twelve-word Recovery Phrase.<br>
            4. Once provided, the whole app with all the wallets (single-key and multi-key) are reproduced.
        </p>
        <h3>Using other wallet coordinator software:</h3>
        <p class="no-margin-p">This method can be used on any wallet/coordinator software, but the beneficiary will need all the Wallet Configuration files. These may be provided by the benefactor along with this document or separately.<br>
            1. Each wallet has its configuration file that can provide "watch-only" access to these wallets.<br>
            2. Import these configuration or descriptor files into a supported software application from the References.<br>
            3. The wallets showing balances are the ones with funds.<br>
            4. The software should also highlight which keys have been used by that wallet using Master Fingerprint.<br>Perform a small test transaction with keys matching the Master Fingerprints to ensure full access.
            Using All n Keys (For Advanced Users):<br>This method should only be used when the above two options are not possible. Any wallet coordinator software can be used, but you will need all the keys for this method.
            1. Suitable for recovering wallets without a configuration file.<br>
            2. Gather all n keys. In the software you choose (see the References section for suggestions), try recreating all possible wallets with different combinations of these n keys.<br>
            3. For different wallets, try combinations of n (e.g., if there are five keys, try combinations with n = 1, 2, 3, 4, and 5).<br>
            4. Within each combination, experiment with different values of m (such that m ≤ n) to find the correct scheme that allows access to the assets.<br>
            5. The References section includes guides for this process, including standard information like derivation paths and script types for both singlesig and multisig options.<br>
    </p>
        </div>
        <br><br>
         <div class="page">
        <div class="center"><h3>References: Resources and Software</h3></div>
        <p>Guides for understanding bitcoin keys:</p>
            1. <a href="https://bitcoinkeeper.app/">www.bitcoinkeeper.app</a><br>
            2. <a href="https://bitcoiner.guide/multisig">www.bitcoiner.guide/multisig</a><br>
            3. <a href="https://btcguide.github.io/why-multisig">www.btcguide.github.io/why-multisig</a><br>
            4. <a href="https://sparrowwallet.com/docs/best-practices.html">www.sparrowwallet.com/docs/best-practices.html</a><br>
            5. <a href="https://www.keepitsimplebitcoin.com/">www.keepitsimplebitcoin.com</a><br>
        <p>Recommended software for wallet recreation:</p>
            1. Keeper: <a href="https://bitcoinkeeper.app/">www.bitcoinkeeper.app</a><br>
            2. Sparrow: <a href="https://www.sparrowwallet.com/">www.sparrowwallet.com</a><br>
            3. Core: <a href="https://bitcoincore.org/">www.bitcoincore.org</a><br>
            4. Electrum: <a href="https://bitcoinelectrum.com/">www.bitcoinelectrum.com</a><br>
        <p>Bitcoin Keeper Customer Support:<br>
            Telegram: <a href="https://t.me/bitcoinkeeper">https://t.me/bitcoinkeeper</a><br>
            Twitter: <a href="https://twitter.com/bitcoinkeeper_">https://twitter.com/bitcoinkeeper_</a><br>
            Email: hello@bithyve.com
        </p>
    </div>
    </div>
    <div class="center"><p>This document is provided by the Bitcoin Keeper app. Need help? Reach out to us via the in-app chat support called Keeper Concierge. For more details visit: <a href="https://bitcoinkeeper.app/">www.bitcoinkeeper.app</a>.</p></div>
    </div>
</body>
</html>

      `;
    const options = {
      html,
      fileName: 'Recovery-Instructions',
      directory: 'Documents',
      base64: true,
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error: any) {
    return error;
  }
};

export default GenerateRecoveryInstrcutionsPDF;
